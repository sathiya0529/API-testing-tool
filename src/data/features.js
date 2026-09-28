import { Send, SlidersHorizontal, ListFilter, Braces, FileJson, Lock, MonitorPlay, Wand2, History, FolderOpen, Layers, ListChecks, ShieldCheck, Bug, Gauge, ArrowUpDown, LayoutDashboard, Bell, Tags } from 'lucide-react';

export const FEATURE_GROUPS = [
  { title: 'Send and inspect', items: [
    { icon: Send, title: 'HTTP request testing', text: 'Send GET, POST, PUT, PATCH and DELETE requests and see exactly what came back.' },
    { icon: SlidersHorizontal, title: 'Request builder', text: 'Method, URL and every setting on one screen, with a live preview of the final URL.' },
    { icon: ListFilter, title: 'Query parameters', text: 'Toggle, edit and remove parameters without hand-editing the query string.' },
    { icon: Tags, title: 'Headers', text: 'Set custom headers per request and switch individual ones off while you debug.' },
    { icon: Braces, title: 'Request body', text: 'JSON with line numbers and validation, form-data key/value pairs, or raw text.' },
    { icon: Lock, title: 'API authentication', text: 'API key, Bearer token and Basic auth, with variables such as {{TOKEN}} supported.' },
    { icon: MonitorPlay, title: 'Response viewer', text: 'Status, time and size at a glance, with body, headers and cookies in separate tabs.' },
    { icon: FileJson, title: 'JSON and XML formatting', text: 'Syntax-highlighted output you can format, copy or download.' },
  ] },
  { title: 'Organise your work', items: [
    { icon: FolderOpen, title: 'Collections', text: 'Group related requests into collections and folders, and duplicate or rename them freely.' },
    { icon: Layers, title: 'Environment variables', text: 'Define Development, Staging and Production once and switch between them from the header.' },
    { icon: History, title: 'Request history', text: 'Every request you send is logged. Reopen it, re-run it or clear the list.' },
    { icon: ArrowUpDown, title: 'Import and export', text: 'Move collections in and out as JSON to share with your team or back them up.' },
  ] },
  { title: 'Test and validate', items: [
    { icon: ListChecks, title: 'Automated tests', text: 'Assert on status code, response time, fields and JSON values, then run them on demand.' },
    { icon: ShieldCheck, title: 'Response validation', text: 'Every response is checked and reported as success, warning or error.' },
    { icon: Bug, title: 'Error detection', text: 'Failed calls, slow responses and malformed bodies are flagged with a plain explanation.' },
  ] },
  { title: 'Monitor', items: [
    { icon: Gauge, title: 'Performance analysis', text: 'Track average, fastest and slowest responses and how they trend over time.' },
    { icon: LayoutDashboard, title: 'Dashboard analytics', text: 'Totals, success rate and recent activity on a single page.' },
    { icon: Bell, title: 'Real-time notifications', text: 'Get told when a request completes or a test passes or fails, without refreshing.' },
  ] },
];
