"use client";

import type * as React from "react";
import type { FieldPath, FieldValues, UseFormReturn } from "react-hook-form";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/shared/components/ui/form";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import { Role } from "@/features/roles/types/Role";
import { Employee } from "@/features/employees/types/Employee";

interface Props<T extends FieldValues>
  extends Omit<React.ComponentPropsWithRef<"form">, "onSubmit"> {
  children: React.ReactNode;
  form: UseFormReturn<T>;
  onSubmit: (data: T) => void;
  employees: Array<Pick<Employee, "id" | "name" | "email">>;
  roles: Array<Pick<Role, "id" | "name">>;
  isEdit?: boolean;
}

export function ProjectMemberForm<T extends FieldValues>({
  form,
  employees,
  roles,
  onSubmit,
  isEdit,
  children,
}: Props<T>) {
  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit, (err) => console.log(err))}
        className="flex flex-col gap-4"
      >
        <FormField
          control={form.control}
          disabled={isEdit}
          name={"employeeId" as FieldPath<T>}
          render={({ field }) => {
            return (
              <FormItem>
                <FormLabel>Employee</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value?.toString()}
                  disabled={field.disabled}
                >
                  <FormControl>
                    <SelectTrigger className="capitalize">
                      <SelectValue placeholder="Select a employee" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectGroup>
                      {employees.map((item) => (
                        <SelectItem
                          key={item.id}
                          value={item.id.toString()}
                          className="capitalize"
                        >
                          <div className="flex flex-col items-start">
                            <span>{item.name}</span>
                            <span className="normal-case text-dark-400 text-xs">
                              {item.email}
                            </span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            );
          }}
        />
        <FormField
          control={form.control}
          name={"roleId" as FieldPath<T>}
          render={({ field }) => {
            return (
              <FormItem>
                <FormLabel>Role</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value?.toString()}
                >
                  <FormControl>
                    <SelectTrigger className="capitalize">
                      <SelectValue placeholder="Select a role" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectGroup>
                      {roles.map((item) => (
                        <SelectItem
                          key={item.id}
                          value={item.id.toString()}
                          className="capitalize"
                        >
                          {item.name}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            );
          }}
        />
        {children}
      </form>
    </Form>
  );
}
