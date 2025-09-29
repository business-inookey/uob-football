export default function UnauthorizedPage() {
  return (
    <div className="p-6 space-y-2">
      <h1 className="text-2xl font-bold">Unauthorized</h1>
      <p className="text-sm text-muted-foreground">
        Your account does not have team access yet. Ask an admin to assign you to a team.
      </p>
      <a href="/login" className="inline-block mt-2 underline">Back to login</a>
    </div>
  );
}


