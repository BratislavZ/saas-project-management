"use client";

import { Header } from "@/shared/components/custom/Header";
import { useState } from "react";

import Link from "next/link";
import { ArrowRightIcon, MenuIcon, XIcon } from "lucide-react";

import { Button } from "@/shared/components/ui/button";
import { SignedIn, SignedOut, SignInButton, useUser } from "@clerk/nextjs";
import { UserButton } from "@/shared/components/custom/UserButton";
import { Logo } from "@/shared/components/custom/Logo";

const DesktopNavigation = () => (
  <nav className="hidden md:flex items-center gap-6">
    <NavLink href="#features">Features</NavLink>
    <NavLink href="#pricing">Pricing</NavLink>
    <NavLink href="#testimonials">Testimonials</NavLink>
  </nav>
);

const MobileNavigation = ({ onLinkClick }: { onLinkClick: () => void }) => (
  <div className="container py-4 md:hidden">
    <nav className="flex flex-col space-y-4">
      <NavLink href="#features" onClick={onLinkClick}>
        Features
      </NavLink>
      <NavLink href="#pricing" onClick={onLinkClick}>
        Pricing
      </NavLink>
      <NavLink href="#testimonials" onClick={onLinkClick}>
        Testimonials
      </NavLink>
    </nav>
  </div>
);

interface NavLinkProps {
  href: string;
  children: React.ReactNode;
  onClick?: () => void;
}

const NavLink = ({ href, children, onClick }: NavLinkProps) => (
  <Link
    href={href}
    className="text-sm font-medium hover:underline underline-offset-4"
    onClick={onClick}
  >
    {children}
  </Link>
);

const MobileMenuButton = ({
  mobileMenuOpen,
  toggleMobileMenu,
}: {
  mobileMenuOpen: boolean;
  toggleMobileMenu: () => void;
}) => (
  <Button
    variant="ghost"
    size="icon"
    className="md:hidden"
    onClick={toggleMobileMenu}
  >
    {mobileMenuOpen ? (
      <XIcon className="h-6 w-6" />
    ) : (
      <MenuIcon className="h-6 w-6" />
    )}
    <span className="sr-only">Toggle menu</span>
  </Button>
);

const AuthButtons = () => {
  const { isLoaded } = useUser();

  if (!isLoaded) return <Button disabled>Loading...</Button>;

  return (
    <>
      <SignedIn>
        <div className="flex items-center gap-4">
          <UserButton />
          <Button asChild variant="default">
            <Link
              href={process.env.NEXT_PUBLIC_CLERK_SIGN_IN_FORCE_REDIRECT_URL!}
              className="flex items-center gap-2"
            >
              Go to Dashboard
              <ArrowRightIcon />
            </Link>
          </Button>
        </div>
      </SignedIn>
      <SignedOut>
        <SignInButton>
          <Button>Login</Button>
        </SignInButton>
      </SignedOut>
    </>
  );
};

export const LandingPageHeader = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => setMobileMenuOpen(!mobileMenuOpen);
  const closeMobileMenu = () => setMobileMenuOpen(false);

  return (
    <Header>
      <div className="container mx-auto flex h-16 items-center justify-between">
        <div className="flex items-center gap-10">
          <Logo />

          <DesktopNavigation />
        </div>
        <div className="flex items-center gap-4">
          <AuthButtons />
          <MobileMenuButton
            mobileMenuOpen={mobileMenuOpen}
            toggleMobileMenu={toggleMobileMenu}
          />
        </div>
      </div>

      {mobileMenuOpen && <MobileNavigation onLinkClick={closeMobileMenu} />}
    </Header>
  );
};
