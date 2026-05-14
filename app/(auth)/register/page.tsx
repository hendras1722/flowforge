import RegisterForm from "./_components/Form";
import { Zap } from "lucide-react";
import Link from "next/link";

export default function RegisterPage() {
	return (
		<div className="flex min-h-screen items-center justify-center bg-background p-4 animate-fade-in">
			<div className="w-full max-w-md space-y-8">
				{/* Header */}
				<div className="text-center space-y-3">
					<div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary/15 mx-auto">
						<Zap className="h-6 w-6 text-primary" />
					</div>
					<h1 className="text-3xl font-bold tracking-tight">Create an account</h1>
					<p className="text-sm text-muted-foreground">
						Join FlowForge and start automating your workflows
					</p>
				</div>

				{/* Register Card */}
				<div className="rounded-2xl border border-border bg-card p-8 shadow-xl shadow-primary/5">
					<RegisterForm />

					<div className="mt-8 text-center text-sm text-muted-foreground">
						Already have an account?{" "}
						<Link
							href="/login"
							className="font-medium text-primary hover:underline underline-offset-4"
						>
							Sign in
						</Link>
					</div>
				</div>

				{/* Footer */}
				<p className="text-center text-xs text-muted-foreground">
					By creating an account, you agree to our{" "}
					<a href="#" className="underline underline-offset-4 hover:text-primary">
						Terms of Service
					</a>{" "}
					and{" "}
					<a href="#" className="underline underline-offset-4 hover:text-primary">
						Privacy Policy
					</a>
					.
				</p>
			</div>
		</div>
	);
}
