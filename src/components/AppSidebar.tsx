import { Book, LogOut, PencilLine, Sailboat } from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

import logo from '../../public/logosidebar.png'

const items = [
  {
    title: "Editar velocidades",
    url: "/editarVelocidades",
    icon: PencilLine,
  },
  {
    title: "Orden velocidad ótima",
    url: "/",
    icon: Book,
  },
  {
    title: "Reporte Combustible",
    url: "/combustible",
    icon: Sailboat,
  },
  {
    title: "Salir",
    url: "#",
    icon: LogOut,
  },
];

export function AppSidebar() {
  return (
    <Sidebar collapsible="icon" className="bg-[#043f80] text-white">
      <SidebarContent>
        <SidebarGroup className="group-data-[collapsible=icon]:hidden">
          <SidebarGroupLabel className="flex flex-col h-auto">
            <img src={logo} width="250" height="" alt="Logo" />
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <a href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                  <SidebarMenuAction className="peer-data-[active=true]/menu-button:opacity-100" />
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
