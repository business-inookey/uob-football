export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 to-neutral-100 flex items-center justify-center p-6">
      <div className="max-w-md w-full">
        <div className="card p-8 text-center space-y-6">
          {/* Icon */}
          <div className="w-20 h-20 mx-auto bg-gradient-to-br from-red-100 to-red-200 rounded-full flex items-center justify-center">
            <svg className="w-10 h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>

          {/* Content */}
          <div className="space-y-3">
            <h1 className="text-3xl font-bold text-foreground">Access Denied</h1>
            <p className="text-muted-foreground leading-relaxed">
              Your account does not have team access yet. Please contact an administrator to assign you to a team.
            </p>
          </div>

          {/* Actions */}
          <div className="space-y-3">
            <a 
              href="/login" 
              className="btn btn-primary w-full"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
              </svg>
              Back to Login
            </a>
            
            <div className="text-center">
              <a 
                href="mailto:admin@uobfootball.com" 
                className="text-sm text-primary hover:text-primary/80 transition-colors"
              >
                Contact Administrator
              </a>
            </div>
          </div>

          {/* Help Text */}
          <div className="pt-4 border-t border-border">
            <p className="text-xs text-muted-foreground">
              If you believe this is an error, please contact your team administrator or system support.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}