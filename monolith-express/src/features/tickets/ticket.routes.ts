import { Router } from "express";
import { createTicketRoute } from "./create-ticket";
import { updateTicketRoute } from "./update-ticket";
import { getTicketRoute } from "./get-ticket";
import { createTicketColumnRoute } from "./create-ticket-column";
import { deleteTicketRoute } from "./delete-ticket";
import { reorderTicketsRoute } from "./reorder-tickets";
import { reorderTicketColumnsRoute } from "./reorder-ticket-columns";
import { getTicketColumnsRoute } from "./get-ticket-columns";
import { updateTicketColumnRoute } from "./update-ticket-column";
import { getTicketColumnRoute } from "./get-ticket-column";
import { deleteTicketColumnRoute } from "./delete-ticket-column";
import { getPaginatedSelfTicketsRoute } from "./get-paginated-self-tickets";

const router = Router();

router.use(createTicketColumnRoute);
router.use(deleteTicketColumnRoute);
router.use(getTicketColumnRoute);
router.use(updateTicketColumnRoute);
router.use(createTicketRoute);
router.use(deleteTicketRoute);
router.use(getTicketColumnsRoute);
router.use(getTicketRoute);
router.use(updateTicketRoute);
router.use(reorderTicketsRoute);
router.use(reorderTicketColumnsRoute);
router.use(getPaginatedSelfTicketsRoute);

export { router as ticketRoutes };
