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
import { Input } from "@/shared/components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import { Organization } from "@/features/organizations/types/Organization";

interface Props<T extends FieldValues>
  extends Omit<React.ComponentPropsWithRef<"form">, "onSubmit"> {
  children: React.ReactNode;
  form: UseFormReturn<T>;
  onSubmit: (data: T) => void;
  isEdit?: boolean;
  organizations: Pick<Organization, "id" | "name">[];
}

export function OrganizationAdminForm<T extends FieldValues>({
  form,
  onSubmit,
  isEdit,
  organizations,
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
          name={"name" as FieldPath<T>}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          disabled={isEdit}
          name={"email" as FieldPath<T>}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input placeholder="example@email.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name={"organizationId" as FieldPath<T>}
          render={({ field }) => {
            return (
              <FormItem>
                <FormLabel>Organization</FormLabel>
                <Select
                  disabled={isEdit}
                  onValueChange={field.onChange}
                  defaultValue={field.value?.toString()}
                >
                  <FormControl>
                    <SelectTrigger className="capitalize">
                      <SelectValue placeholder="Select a label" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectGroup>
                      {organizations.map((item) => (
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
