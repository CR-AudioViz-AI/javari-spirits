'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ModeToggle } from '@/components/mode-toggle';
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from '@/components/ui/navigation-menu';
import { Wine, Search, Menu, X, User, Gamepad2, GraduationCap, Landmark } from 'lucide-react';

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <Wine className="h-8 w-8 text-amber-600" />
          <span className="text-xl font-bold">
            CRAV<span className="text-amber-600">Barrels</span>
          </span>
        </Link>

        {/* Desktop Navigation */}
        <NavigationMenu className="hidden md:flex">
          <NavigationMenuList>
            <NavigationMenuItem>
              <NavigationMenuTrigger>Explore</NavigationMenuTrigger>
              <NavigationMenuContent>
                <div className="grid gap-3 p-4 w-[400px]">
                  <Link href="/explore" className="block p-3 hover:bg-accent rounded-md">
                    <div className="font-medium">Browse Spirits</div>
                    <div className="text-sm text-muted-foreground">22,000+ bottles to discover</div>
                  </Link>
                  <Link href="/distilleries" className="block p-3 hover:bg-accent rounded-md">
                    <div className="font-medium">Distilleries</div>
                    <div className="text-sm text-muted-foreground">1,000+ distilleries worldwide</div>
                  </Link>
                  <Link href="/cocktails" className="block p-3 hover:bg-accent rounded-md">
                    <div className="font-medium">Cocktails</div>
                    <div className="text-sm text-muted-foreground">300+ classic recipes</div>
                  </Link>
                </div>
              </NavigationMenuContent>
            </NavigationMenuItem>

            <NavigationMenuItem>
              <Link href="/games" legacyBehavior passHref>
                <NavigationMenuLink className="flex items-center gap-1 px-4 py-2 hover:text-amber-600">
                  <Gamepad2 className="h-4 w-4" />
                  Games
                </NavigationMenuLink>
              </Link>
            </NavigationMenuItem>

            <NavigationMenuItem>
              <Link href="/learn" legacyBehavior passHref>
                <NavigationMenuLink className="flex items-center gap-1 px-4 py-2 hover:text-amber-600">
                  <GraduationCap className="h-4 w-4" />
                  Learn
                </NavigationMenuLink>
              </Link>
            </NavigationMenuItem>

            <NavigationMenuItem>
              <Link href="/history" legacyBehavior passHref>
                <NavigationMenuLink className="flex items-center gap-1 px-4 py-2 hover:text-amber-600">
                  <Landmark className="h-4 w-4" />
                  Museum
                </NavigationMenuLink>
              </Link>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>

        {/* Right side actions */}
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="hidden md:flex">
            <Search className="h-5 w-5" />
          </Button>
          <ModeToggle />
          <Link href="/login">
            <Button variant="outline" size="sm" className="hidden md:flex">
              <User className="h-4 w-4 mr-2" />
              Sign In
            </Button>
          </Link>
          <Link href="/signup">
            <Button size="sm" className="hidden md:flex bg-amber-600 hover:bg-amber-700">
              Get Started
            </Button>
          </Link>
          
          {/* Mobile menu button */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t p-4 space-y-2">
          <Link href="/explore" className="block p-2 hover:bg-accent rounded">Explore Spirits</Link>
          <Link href="/distilleries" className="block p-2 hover:bg-accent rounded">Distilleries</Link>
          <Link href="/cocktails" className="block p-2 hover:bg-accent rounded">Cocktails</Link>
          <Link href="/games" className="block p-2 hover:bg-accent rounded">Games</Link>
          <Link href="/learn" className="block p-2 hover:bg-accent rounded">Learn</Link>
          <Link href="/history" className="block p-2 hover:bg-accent rounded">Museum</Link>
          <hr className="my-2" />
          <Link href="/login" className="block p-2 hover:bg-accent rounded">Sign In</Link>
          <Link href="/signup" className="block p-2 bg-amber-600 text-white rounded text-center">Get Started</Link>
        </div>
      )}
    </header>
  );
}
