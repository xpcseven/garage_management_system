import React from "react";

const AuthLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="relative min-h-screen overflow-hidden bg-mist dark:bg-background">
      <div className="absolute inset-0 bg-gradient-to-br from-plum-dark via-plum to-orchid dark:from-background dark:via-card dark:to-background" />
      <div className="pointer-events-none absolute -top-24 start-1/2 h-[26rem] w-[26rem] -translate-x-1/2 rounded-full bg-orchid/30 blur-3xl dark:bg-orchid/20" />
      <div className="pointer-events-none absolute -bottom-28 -end-24 h-[24rem] w-[24rem] rounded-full bg-fuchsia-brand/20 blur-3xl dark:bg-orchid/10" />
      <div className="pointer-events-none absolute inset-0 opacity-[0.06] [background:linear-gradient(to_right,#ffffff_1px,transparent_1px),linear-gradient(to_bottom,#ffffff_1px,transparent_1px)] [background-size:36px_36px] dark:opacity-[0.04]" />

      <div className="relative z-10 flex min-h-screen items-center justify-center p-4 sm:p-6">
        {children}
      </div>
    </div>
  );
};

export default AuthLayout;
