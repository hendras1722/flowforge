"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useActionState, useEffect } from "react";
import { registerAction } from "@/actions/auth";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

const initialState = {
	success: false,
	message: "",
};

export default function RegisterForm() {
	const router = useRouter();
	const [state, formAction, isPending] = useActionState(
		registerAction,
		initialState,
	);

	useEffect(() => {
		if (state?.success) {
			// Small delay to show success message
			const timer = setTimeout(() => {
				router.push("/login");
			}, 1500);
			return () => clearTimeout(timer);
		}
	}, [state, router]);

	return (
		<div className="space-y-4">
			<form action={formAction} className="space-y-4">
				<div className="space-y-2">
					<label htmlFor="name" className="text-sm font-medium">
						Full Name
					</label>
					<Input
						id="name"
						name="name"
						type="text"
						placeholder="John Doe"
						required
					/>
				</div>
				<div className="space-y-2">
					<label htmlFor="email" className="text-sm font-medium">
						Email Address
					</label>
					<Input
						id="email"
						name="email"
						type="email"
						placeholder="name@example.com"
						required
						autoComplete="email"
					/>
				</div>
				<div className="space-y-2">
					<label htmlFor="password" title="Password" className="text-sm font-medium">
						Password
					</label>
					<Input
						id="password"
						name="password"
						type="password"
						placeholder="••••••••"
						required
						autoComplete="new-password"
						minLength={8}
					/>
				</div>

				{state?.message && (
					<div className={cn(
						"rounded-lg border px-4 py-2.5 text-xs font-medium",
						state.success 
							? "bg-success/10 border-success/20 text-success" 
							: "bg-destructive/10 border-destructive/20 text-destructive"
					)}>
						{state.message}
					</div>
				)}

				<Button type="submit" className="w-full" disabled={isPending}>
					{isPending ? (
						<>
							<Loader2 className="mr-2 h-4 w-4 animate-spin" />
							Creating account...
						</>
					) : (
						"Create Account"
					)}
				</Button>
			</form>
		</div>
	);
}
