Goal:Build a mulit-tenant support disk SaaS and name it "PulseDesk". Use tech stack -
Frontend: React 19 + Vite, styled with Tailwind

Tests: Pest or PHPUnit feature tests on the API

CI: A github actions workflow that installs,migrates and runs tests on each PR.
Core features it must have-
Multi-tenancy : A user from organization A should never be able to see organization B's data. 
Auth & Roles : Should have registration/login feature. Roles are-admin, agent, customer.
Tickets CRUD : for fields like subject, description, status (with options of open/pending/resolved/closed), priority (with options low, medium, high,urgent), requester (customer), assignee being the agent, tags/labels, created/updated timestamps.
Ticket conversation - Threaded replies on a ticket - visible to the customer and an internam note which is visible to agents only.
List + filters + search - A ticket list filterble by status, priority and assignee with text search on subject/body.
REST API + React frontend : A documenteed JSON API consumed by React app 
Seeded demo data: A seedee that creates 1 org, an admin , 2 agents, 2 customers and 12 tickets so a judge sees a populated app instantly. 