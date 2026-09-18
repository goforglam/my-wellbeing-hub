import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { AppShell, PageHeader } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/lib/auth";
import { useStore } from "@/lib/store";

export const Route=createFileRoute("/settings")({component:SettingsPage});

function SettingsPage(){
 const {data,updateProfile,clearAllData,exportJSON}=useStore(); const {session,signOut}=useAuth(); const [name,setName]=useState(data.profile.display_name);
 const save=()=>{updateProfile({display_name:name});toast.success("Profile updated");};
 const download=()=>{const blob=new Blob([exportJSON()],{type:"application/json"});const url=URL.createObjectURL(blob);const a=document.createElement("a");a.href=url;a.download="work-wellbeing-export.json";a.click();URL.revokeObjectURL(url);};
 return <AppShell><PageHeader title="Settings" subtitle="Your profile, privacy controls and data tools."/>
 <div className="grid gap-5 lg:grid-cols-2">
  <Card className="surface"><CardHeader><CardTitle>Profile</CardTitle><CardDescription>{session?.user.email}</CardDescription></CardHeader><CardContent className="space-y-4"><div className="space-y-1.5"><Label htmlFor="display-name">Display name</Label><Input id="display-name" value={name} onChange={e=>setName(e.target.value)} className="h-11 rounded-xl"/></div><Button onClick={save} className="rounded-xl">Save profile</Button></CardContent></Card>
  <Card className="surface"><CardHeader><CardTitle>Privacy & data</CardTitle><CardDescription>Your data is scoped to your authenticated Supabase account with Row Level Security.</CardDescription></CardHeader><CardContent className="space-y-3"><Button variant="outline" onClick={download} className="w-full rounded-xl">Export my data</Button><Button variant="outline" onClick={()=>{clearAllData();toast.success("Local view cleared");}} className="w-full rounded-xl">Clear current view</Button><Button variant="outline" onClick={()=>void signOut()} className="w-full rounded-xl">Sign out</Button></CardContent></Card>
 </div></AppShell>;
}
