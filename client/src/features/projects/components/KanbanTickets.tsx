"use client";

import { useOrganizationId } from "@/features/organizations/hooks/useOrganizationId";
import { useProjectMembersPromise } from "@/features/project-members/providers/ProjectMembersProvider";
import {
  reorderColumnsAction,
  reorderTicketsAction,
} from "@/features/tickets/actions";
import { DeleteTicketColumnDialog } from "@/features/tickets/components/dialogs/DeleteTicketColumnDialog";
import { DeleteTicketDialog } from "@/features/tickets/components/dialogs/DeleteTicketDialog";
import { EditTicketColumnDialogWrapper } from "@/features/tickets/components/dialogs/EditTicketColumnDialogWrapper";
import { EditTicketSheetWrapper } from "@/features/tickets/components/sheets/EditTicketSheetWrapper";
import { useTicketColumnsPromise } from "@/features/tickets/providers/TicketColumnsProvider";
import { ticketColumnsFilterParsers } from "@/features/tickets/schemas/get-schemas";
import { Ticket, TicketInColumn } from "@/features/tickets/types/Ticket";
import { TicketColumn as TypeTicketColumn } from "@/features/tickets/types/TicketColumn";
import { getTicketPriorityBadge } from "@/features/tickets/utils";
import { Can } from "@/shared/components/custom/auth/Can";
import * as Kanban from "@/shared/components/custom/Kanban";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { DragEndEvent } from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";
import { formatDate, parseISO } from "date-fns";
import { GripVertical } from "lucide-react";
import { useQueryStates } from "nuqs";
import * as React from "react";
import { toast } from "sonner";
import { useProjectId } from "../hooks/useProjectId";
import { useProjectAuthorization } from "../providers/ProjectAuthProvider";
import { useProjectPromise } from "../providers/ProjectProvider";
import { extractColumnId, generateColumnIdentifier } from "../utils";

type ModalState = {
  ticketEdit: Ticket["id"] | null;
  ticketDelete: Ticket["id"] | null;
  columnEdit: TypeTicketColumn["id"] | null;
  columnDelete: TypeTicketColumn["id"] | null;
};

type KanbanData = Record<string, TicketInColumn[]>;

export function KanbanTickets() {
  const projectAuthorization = useProjectAuthorization();

  const [modals, setModals] = React.useState<ModalState>({
    ticketEdit: null,
    ticketDelete: null,
    columnEdit: null,
    columnDelete: null,
  });

  const project = React.use(useProjectPromise());
  const rawTicketColumns = React.use(useTicketColumnsPromise());
  const allProjectMembers = React.use(useProjectMembersPromise());

  const organizationId = useOrganizationId();
  const projectId = useProjectId();

  const isDisabled = project.status === "ARCHIVED";

  const { isAnyFilterActive } = useKanbanFilters();

  const { columnsTitles, transformedColumns } =
    useTransformedColumnsData(rawTicketColumns);

  const [columns, setColumns] = React.useState<KanbanData>(transformedColumns);

  React.useEffect(() => {
    setColumns(transformedColumns);
  }, [transformedColumns]);

  async function handleReorderColumns(event: DragEndEvent) {
    const { active, over } = event;

    // there is no active or over item
    if (!active || !over) return;

    // active and over are the same, don't do anything
    if (active.id === over.id) return;

    const columnIdFrom = extractColumnId(active.id as string);
    const columnIdTo = extractColumnId(over.id as string);

    const columnFromIndex = rawTicketColumns.findIndex(
      (column) => column.id === columnIdFrom
    );
    const columnToIndex = rawTicketColumns.findIndex(
      (column) => column.id === columnIdTo
    );
    if (columnFromIndex === -1 || columnToIndex === -1)
      throw new Error("Invalid column id");

    const newColumns = arrayMove(
      rawTicketColumns,
      columnFromIndex,
      columnToIndex
    );

    const columnsWithUpdatedPositions = newColumns.map((column, index) => {
      return {
        ...column,
        position: index,
      };
    });

    const { error } = await reorderColumnsAction({
      organizationId,
      projectId,
      ticketColumns: columnsWithUpdatedPositions,
    });
    if (error) {
      toast.error(error.details);
    }
  }

  async function handleReorderTickets() {
    if (!projectAuthorization.can("TICKET_REORDER")) {
      setColumns(transformedColumns);
      toast.error("You do not have permission to reorder tickets.");
      return;
    }

    if (isAnyFilterActive) {
      setColumns(transformedColumns);
      toast.error("You cannot reorder tickets while filters are applied.");
      return;
    }

    const tickets = Object.entries(columns).flatMap(
      ([columnIdentifier, tasks]) =>
        tasks.map((task, index) => ({
          id: task.id,
          position: index,
          ticketColumnId: extractColumnId(columnIdentifier),
        }))
    );
    if (tickets.length === 0) return;

    const { error } = await reorderTicketsAction({
      organizationId,
      projectId,
      tickets,
    });

    if (error) {
      toast.error(error.details);
    }
  }

  if (rawTicketColumns.length === 0) {
    return <EmptyKanbanBoard />;
  }

  return (
    <>
      <EditTicketSheetWrapper
        open={!!modals.ticketEdit}
        ticketId={modals.ticketEdit ?? undefined}
        projectId={projectId}
        onOpenChange={() =>
          setModals((prev) => ({ ...prev, ticketEdit: null }))
        }
        onDelete={(id) => setModals((prev) => ({ ...prev, ticketDelete: id }))}
      />
      <DeleteTicketDialog
        open={!!modals.ticketDelete}
        ticketId={modals.ticketDelete ?? undefined}
        onOpenChange={() =>
          setModals((prev) => ({ ...prev, ticketDelete: null }))
        }
        onSuccess={() => setModals((prev) => ({ ...prev, ticketEdit: null }))}
      />
      <EditTicketColumnDialogWrapper
        open={!!modals.columnEdit}
        columnId={modals.columnEdit ?? undefined}
        onOpenChange={() =>
          setModals((prev) => ({ ...prev, columnEdit: null }))
        }
        onDelete={(id) => setModals((prev) => ({ ...prev, columnDelete: id }))}
      />
      <DeleteTicketColumnDialog
        open={!!modals.columnDelete}
        columnId={modals.columnDelete ?? undefined}
        onOpenChange={() =>
          setModals((prev) => ({ ...prev, columnDelete: null }))
        }
        onSuccess={() => setModals((prev) => ({ ...prev, columnEdit: null }))}
      />
      <Kanban.Root
        value={columns}
        onValueChange={setColumns}
        onDragEnd={async (event) => {
          const { active, over } = event;
          if (!active || !over) return;

          if (active.id in columns && over.id in columns) {
            await handleReorderColumns(event);
            return;
          }

          await handleReorderTickets();
        }}
        getItemValue={(item) => item.id}
      >
        <div className="flex-1 overflow-hidden flex flex-col p-4 bg-white rounded-lg shadow-sm h-[calc(100vh-20rem)]">
          <div className="flex-1 overflow-x-auto overflow-y-hidden">
            <Kanban.Board className="inline-flex h-full min-w-full gap-4">
              {Object.entries(columns).map(([columnValue, tasks]) => (
                <div
                  key={columnValue}
                  className="w-[calc(100%/6)] min-w-[250px] h-full flex-shrink-0"
                >
                  <TicketColumn
                    columnsTitles={columnsTitles}
                    value={columnValue}
                    tickets={tasks}
                    setModals={setModals}
                    disabled={isDisabled}
                  />
                </div>
              ))}
            </Kanban.Board>
          </div>
        </div>

        <Kanban.Overlay>
          {({ value, variant }) => {
            if (variant === "column") {
              const tasks = columns[value] ?? [];

              return (
                <TicketColumn
                  columnsTitles={columnsTitles}
                  value={value}
                  tickets={tasks}
                />
              );
            }

            const task = Object.values(columns)
              .flat()
              .find((task) => task.id === value);

            if (!task) return null;

            return <TicketCard ticket={task} />;
          }}
        </Kanban.Overlay>
      </Kanban.Root>
    </>
  );
}

interface TicketCardProps
  extends Omit<React.ComponentProps<typeof Kanban.Item>, "value"> {
  ticket: TicketInColumn;
  setModals?: React.Dispatch<React.SetStateAction<ModalState>>;
}

function TicketCard({ ticket, setModals, ...props }: TicketCardProps) {
  return (
    <Kanban.Item key={ticket.id} value={ticket.id} asChild {...props}>
      <div className="rounded-md border bg-card p-3 shadow-xs">
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between gap-2">
            <span
              onMouseDown={(e) => {
                // Prevent dnd-kit's mousedown listener on parent elements
                // from initiating a drag when this span is clicked.
                e.stopPropagation();
              }}
              onClick={() =>
                setModals?.((prev) => ({
                  ...prev,
                  ticketEdit: ticket.id,
                }))
              }
              className="line-clamp-1 font-medium text-sm cursor-pointer hover:underline-offset-4 hover:underline"
            >
              {ticket.title}
            </span>
            {getTicketPriorityBadge(ticket.priority)}
          </div>
          <div className="flex items-center justify-between text-muted-foreground text-xs w-full">
            {ticket.assignee ? (
              <div className="flex items-center gap-1">
                <div className="size-2 rounded-full bg-primary/20" />
                <span className="line-clamp-1">{ticket.assignee.name}</span>
              </div>
            ) : (
              <p className="text-dark-300">unassigned</p>
            )}
            {ticket.dueDate && (
              <time className="text-[10px] tabular-nums flex-1 text-end">
                {formatDate(parseISO(ticket.dueDate), "dd/MM/yyyy")}
              </time>
            )}
          </div>
        </div>
      </div>
    </Kanban.Item>
  );
}

interface TicketColumnProps
  extends Omit<React.ComponentProps<typeof Kanban.Column>, "children"> {
  tickets: TicketInColumn[];
  columnsTitles: Record<string, string>;
  setModals?: React.Dispatch<React.SetStateAction<ModalState>>;
}

function TicketColumn({
  value,
  tickets,
  columnsTitles,
  setModals,
  ...props
}: TicketColumnProps) {
  console.log();
  return (
    <Kanban.Column value={value} {...props}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span
            onClick={() => {
              setModals?.((prev) => ({
                ...prev,
                columnEdit: extractColumnId(value.toString()),
              }));
            }}
            className="font-semibold text-sm cursor-pointer hover:underline-offset-4 hover:underline"
          >
            {columnsTitles[value]}
          </span>
          <Badge variant="secondary" className="pointer-events-none rounded-sm">
            {tickets.length}
          </Badge>
        </div>
        <Can permission="TICKET_COLUMN_REORDER">
          <Kanban.ColumnHandle asChild>
            <Button variant="ghost" size="icon">
              <GripVertical className="h-4 w-4" />
            </Button>
          </Kanban.ColumnHandle>
        </Can>
      </div>
      <div className="flex flex-col gap-2 p-0.5 overflow-y-auto">
        {tickets.map((ticket) => (
          <TicketCard
            key={ticket.id}
            setModals={setModals}
            ticket={ticket}
            asHandle
          />
        ))}
      </div>
    </Kanban.Column>
  );
}

function useTransformedColumnsData(ticketColumns: TypeTicketColumn[]) {
  const columnsTitles = React.useMemo(() => {
    return ticketColumns.reduce((acc, column) => {
      const { name, id } = column;
      acc[generateColumnIdentifier(id)] = name;
      return acc;
    }, {} as Record<string, string>);
  }, [ticketColumns]);

  const transformedColumns = React.useMemo(() => {
    return ticketColumns.reduce((acc, column) => {
      const { tickets, id } = column;
      acc[generateColumnIdentifier(id)] = tickets;
      return acc;
    }, {} as KanbanData);
  }, [ticketColumns]);

  return { columnsTitles, transformedColumns };
}

function EmptyKanbanBoard() {
  return (
    <div className="border border-dark-300 rounded-md bg-amber-400/20 w-full h-72 flex items-center justify-center text-lg font-semibold">
      No ticket columns
    </div>
  );
}

export function KanbanTicketsSkeleton() {
  return (
    <div className="grid auto-rows-fr grid-cols-5 gap-4">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="flex flex-col gap-3 rounded-lg border p-3">
          {/* Column header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Skeleton className="h-5 w-24" /> {/* Column title */}
              <Skeleton className="h-5 w-6" /> {/* Count badge */}
            </div>
            <Skeleton className="h-9 w-9 rounded-md" /> {/* Grip handle */}
          </div>

          {/* Column tickets */}
          <div className="flex flex-col gap-2">
            {[...Array(3)].map((_, j) => (
              <div key={j} className="rounded-md border p-3">
                <div className="flex flex-col gap-2">
                  <div className="flex justify-between gap-2">
                    <Skeleton className="h-4 w-32" /> {/* Ticket title */}
                    <Skeleton className="h-4 w-12" /> {/* Priority badge */}
                  </div>
                  <div className="flex justify-between">
                    <Skeleton className="h-3 w-16" /> {/* Assignee */}
                    <Skeleton className="h-3 w-12" /> {/* Due date */}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function useKanbanFilters() {
  const [filters, setFilters] = useQueryStates(ticketColumnsFilterParsers, {
    history: "replace",
    shallow: false,
  });

  const isAnyFilterActive = React.useMemo(() => {
    return Object.values(filters).some(
      (filter) => filter !== "" && filter !== null && filter !== undefined
    );
  }, [filters]);

  return { filters, setFilters, isAnyFilterActive };
}

export function ResetFiltersButton() {
  const { isAnyFilterActive, setFilters } = useKanbanFilters();

  if (!isAnyFilterActive) return null;

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      onClick={() => setFilters(null)}
    >
      Reset
    </Button>
  );
}
