"use client";
import * as React from "react";
import {
  Alert,
  Avatar,
  AvatarGroup,
  Badge,
  Breadcrumb,
  Button,
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  Checkbox,
  Divider,
  Drawer,
  EmptyState,
  FormField,
  Input,
  Modal,
  PageHeader,
  Pagination,
  Radio,
  RadioGroup,
  Select,
  Skeleton,
  Spinner,
  Switch,
  Tabs,
  Textarea,
  ToastProvider,
  Tooltip,
  useToast,
} from "@/components/ui";
import {
  Search,
  Mail,
  Plus,
  Trash2,
  Inbox,
  Settings,
  LayoutDashboard,
  User,
} from "lucide-react";

function Section({ id, title, children }: { id: string; title: string; children: React.ReactNode }) {
  return (
    <section id={id} className="scroll-mt-20">
      <h2 className="text-lg font-semibold text-gray-900 mb-3">{title}</h2>
      <Card padding="lg" className="flex flex-wrap items-start gap-4">
        {children}
      </Card>
    </section>
  );
}

function ShowcaseInner() {
  const { success, error, info, warning } = useToast();
  const [tab, setTab] = React.useState("overview");
  const [pillTab, setPillTab] = React.useState("day");
  const [page, setPage] = React.useState(3);
  const [modalOpen, setModalOpen] = React.useState(false);
  const [drawerOpen, setDrawerOpen] = React.useState(false);
  const [radio, setRadio] = React.useState("resident");
  const [switched, setSwitched] = React.useState(true);
  const [checked, setChecked] = React.useState(true);
  const [indeterminate, setIndeterminate] = React.useState(true);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <PageHeader
        title="Design System"
        description="Component library used across the lokul.club web app. All components are tokenized and locale-ready."
        breadcrumbs={[{ label: "Home", href: "/" }, { label: "Design System" }]}
        actions={
          <>
            <Button variant="outline" leftIcon={<Settings className="size-4" />}>Settings</Button>
            <Button leftIcon={<Plus className="size-4" />}>New component</Button>
          </>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-[200px_1fr] gap-8">
        <aside className="hidden lg:block">
          <nav className="sticky top-6 flex flex-col gap-1 text-sm">
            {[
              ["buttons", "Buttons"],
              ["inputs", "Inputs"],
              ["forms", "Form controls"],
              ["badges", "Badges"],
              ["avatars", "Avatars"],
              ["alerts", "Alerts"],
              ["overlays", "Overlays"],
              ["navigation", "Navigation"],
              ["feedback", "Feedback"],
              ["data", "Data display"],
            ].map(([id, label]) => (
              <a
                key={id}
                href={`#${id}`}
                className="px-3 h-8 inline-flex items-center rounded text-gray-600 hover:bg-surface-muted hover:text-gray-900"
              >
                {label}
              </a>
            ))}
          </nav>
        </aside>

        <div className="flex flex-col gap-8">
          {/* Buttons */}
          <Section id="buttons" title="Buttons">
            <Button>Primary</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="outline">Outline</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="destructive" leftIcon={<Trash2 className="size-4" />}>Delete</Button>
            <Button variant="link">Link button</Button>
            <Button loading>Loading</Button>
            <Button disabled>Disabled</Button>
            <Button size="xs">XS</Button>
            <Button size="sm">SM</Button>
            <Button size="md">MD</Button>
            <Button size="lg">LG</Button>
          </Section>

          {/* Inputs */}
          <Section id="inputs" title="Inputs">
            <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField label="Email" htmlFor="email" required hint="We'll never share your email.">
                <Input id="email" type="email" leftIcon={<Mail className="size-4" />} placeholder="you@lokul.club" />
              </FormField>
              <FormField label="Search" htmlFor="search">
                <Input id="search" leftIcon={<Search className="size-4" />} placeholder="Search anything…" />
              </FormField>
              <FormField label="Password" htmlFor="pw" error="Password too short">
                <Input id="pw" type="password" invalid />
              </FormField>
              <FormField label="Role" htmlFor="role">
                <Select id="role" defaultValue="resident">
                  <option value="resident">Resident</option>
                  <option value="merchant">Merchant</option>
                  <option value="rwa">RWA</option>
                </Select>
              </FormField>
              <FormField label="Bio" htmlFor="bio" className="md:col-span-2">
                <Textarea id="bio" placeholder="Tell us about yourself…" />
              </FormField>
            </div>
          </Section>

          {/* Form controls */}
          <Section id="forms" title="Checkbox · Radio · Switch">
            <div className="flex flex-col gap-3">
              <Checkbox label="I agree to the terms" checked={checked} onChange={(e) => setChecked(e.target.checked)} />
              <Checkbox label="Receive marketing emails" description="You can unsubscribe anytime." />
              <Checkbox
                label="Select all"
                indeterminate={indeterminate}
                onChange={() => setIndeterminate(false)}
              />
              <Checkbox label="Disabled option" disabled />
            </div>
            <Divider orientation="vertical" className="hidden md:block min-h-32" />
            <div className="flex flex-col gap-3">
              <RadioGroup name="role" value={radio} onChange={setRadio}>
                <Radio value="resident" label="Resident" description="Living in the neighbourhood." />
                <Radio value="merchant" label="Merchant" description="Local business owner." />
                <Radio value="rwa" label="RWA" description="Resident Welfare Association." />
              </RadioGroup>
            </div>
            <Divider orientation="vertical" className="hidden md:block min-h-32" />
            <div className="flex flex-col gap-3">
              <Switch label="Email notifications" checked={switched} onChange={(e) => setSwitched(e.target.checked)} />
              <Switch label="SMS notifications" description="Standard SMS rates apply." />
              <Switch label="Disabled" disabled />
            </div>
          </Section>

          {/* Badges */}
          <Section id="badges" title="Badges">
            <Badge>Default</Badge>
            <Badge tone="brand">Brand</Badge>
            <Badge tone="accent">Accent</Badge>
            <Badge tone="success">Success</Badge>
            <Badge tone="warning">Warning</Badge>
            <Badge tone="danger">Danger</Badge>
            <Badge tone="info">Info</Badge>
            <Badge tone="brand" variant="solid">Solid</Badge>
            <Badge tone="success" variant="outline">Outline</Badge>
          </Section>

          {/* Avatars */}
          <Section id="avatars" title="Avatars">
            <Avatar name="Vivek Anand" size="xs" />
            <Avatar name="Priya Sharma" size="sm" />
            <Avatar name="Rahul Mehta" size="md" />
            <Avatar name="Anjali Iyer" size="lg" />
            <Avatar name="Karan Verma" size="xl" />
            <AvatarGroup max={3} className="ml-4">
              <Avatar name="Aisha Khan" />
              <Avatar name="Ravi Kumar" />
              <Avatar name="Sneha Rao" />
              <Avatar name="Manoj P" />
              <Avatar name="Divya N" />
            </AvatarGroup>
          </Section>

          {/* Alerts */}
          <Section id="alerts" title="Alerts">
            <div className="w-full flex flex-col gap-3">
              <Alert tone="info" title="Heads up">A new locality has been added to your watchlist.</Alert>
              <Alert tone="success" title="Saved">Your changes have been saved successfully.</Alert>
              <Alert tone="warning" title="Verify your phone">Verification expires in 10 minutes.</Alert>
              <Alert tone="danger" title="Could not sign in" onClose={() => {}}>
                Invalid email or password. Try again.
              </Alert>
            </div>
          </Section>

          {/* Overlays */}
          <Section id="overlays" title="Modal · Drawer · Tooltip · Toast">
            <Button onClick={() => setModalOpen(true)}>Open modal</Button>
            <Button variant="outline" onClick={() => setDrawerOpen(true)}>Open drawer</Button>
            <Tooltip content="This is a tooltip">
              <Button variant="ghost">Hover me</Button>
            </Tooltip>
            <Button variant="secondary" onClick={() => success("Saved!", "Profile updated successfully.")}>Toast success</Button>
            <Button variant="secondary" onClick={() => error("Failed", "Something went wrong.")}>Toast error</Button>
            <Button variant="secondary" onClick={() => warning("Heads up", "Connection unstable.")}>Toast warning</Button>
            <Button variant="secondary" onClick={() => info("Did you know?", "Press ⌘K to search.")}>Toast info</Button>

            <Modal
              open={modalOpen}
              onClose={() => setModalOpen(false)}
              title="Confirm action"
              description="This will permanently delete the selected entry."
              footer={
                <>
                  <Button variant="outline" onClick={() => setModalOpen(false)}>Cancel</Button>
                  <Button variant="destructive" onClick={() => setModalOpen(false)}>Delete</Button>
                </>
              }
            >
              <p className="text-sm text-gray-600">
                Are you sure you want to proceed? This action cannot be undone.
              </p>
            </Modal>

            <Drawer
              open={drawerOpen}
              onClose={() => setDrawerOpen(false)}
              title="Entry details"
              footer={
                <>
                  <Button variant="outline" onClick={() => setDrawerOpen(false)}>Close</Button>
                  <Button onClick={() => setDrawerOpen(false)}>Save</Button>
                </>
              }
            >
              <div className="flex flex-col gap-4">
                <FormField label="Name"><Input defaultValue="Vivek Anand" /></FormField>
                <FormField label="Locality"><Input defaultValue="Indiranagar, Bengaluru" /></FormField>
                <FormField label="Role">
                  <Select defaultValue="resident">
                    <option value="resident">Resident</option>
                    <option value="merchant">Merchant</option>
                    <option value="rwa">RWA</option>
                  </Select>
                </FormField>
              </div>
            </Drawer>
          </Section>

          {/* Navigation */}
          <Section id="navigation" title="Tabs · Breadcrumb · Pagination">
            <div className="w-full flex flex-col gap-5">
              <Breadcrumb
                items={[
                  { label: "Admin", href: "/admin" },
                  { label: "Entries", href: "/admin/entries" },
                  { label: "Detail" },
                ]}
              />
              <Tabs
                items={[
                  { value: "overview", label: "Overview", icon: <LayoutDashboard className="size-4" /> },
                  { value: "entries", label: "Entries", icon: <Inbox className="size-4" /> },
                  { value: "users", label: "Users", icon: <User className="size-4" /> },
                  { value: "settings", label: "Settings", icon: <Settings className="size-4" /> },
                ]}
                value={tab}
                onChange={setTab}
              />
              <Tabs
                variant="pill"
                items={[
                  { value: "day", label: "Day" },
                  { value: "week", label: "Week" },
                  { value: "month", label: "Month" },
                  { value: "year", label: "Year" },
                ]}
                value={pillTab}
                onChange={setPillTab}
              />
              <Pagination page={page} pageCount={12} onPageChange={setPage} />
            </div>
          </Section>

          {/* Feedback */}
          <Section id="feedback" title="Spinner · Skeleton">
            <Spinner size="sm" />
            <Spinner size="md" />
            <Spinner size="lg" />
            <div className="w-full flex flex-col gap-2 max-w-sm">
              <Skeleton className="h-4 w-2/3" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
              <div className="flex items-center gap-3 mt-2">
                <Skeleton className="size-10 rounded-full" />
                <div className="flex-1 flex flex-col gap-1.5">
                  <Skeleton className="h-3 w-32" />
                  <Skeleton className="h-3 w-24" />
                </div>
              </div>
            </div>
          </Section>

          {/* Data display */}
          <Section id="data" title="Card · Empty state">
            <Card className="w-full md:w-80">
              <CardHeader>
                <div>
                  <CardTitle>Indiranagar</CardTitle>
                  <CardDescription>560038 · Bengaluru, KA</CardDescription>
                </div>
                <Badge tone="brand">128 signups</Badge>
              </CardHeader>
              <p className="text-sm text-gray-600">
                A buzzing neighbourhood in east Bengaluru known for cafes, shops, and community events.
              </p>
              <CardFooter>
                <Button variant="outline" size="sm">View</Button>
                <Button size="sm">Notify residents</Button>
              </CardFooter>
            </Card>
            <Card className="w-full md:w-96" padding="none">
              <EmptyState
                icon={<Inbox className="size-6" />}
                title="No entries yet"
                description="Once people sign up to the waitlist, they will appear here."
                action={<Button leftIcon={<Plus className="size-4" />}>Add manually</Button>}
              />
            </Card>
          </Section>
        </div>
      </div>
    </div>
  );
}

export default function DesignSystemPage() {
  return (
    <ToastProvider>
      <ShowcaseInner />
    </ToastProvider>
  );
}
