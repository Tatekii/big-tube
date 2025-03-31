"use client"

import { z } from "zod"
import Link from "next/link"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form"

import { FC } from "react"
import useLogin from "../api/useLogin"
import { DottedSeparator } from "@/components/dotted-separator"
import { loginSchema } from "../schema"
import { SIGN_UP_PATH } from "@/constants"

const SignInCard: FC = () => {
	const { mutate, isPending } = useLogin()

	const form = useForm<z.infer<typeof loginSchema>>({
		resolver: zodResolver(loginSchema),
		defaultValues: {
			email: "",
			password: "",
		},
	})

	const onSubmit = (values: z.infer<typeof loginSchema>) => {
		mutate(values)
	}

	return (
		<Card className="w-full max-w-screen-sm h-full md:w-[487px] border-none shadow-none">
			<CardHeader className="flex items-center justify-center text-center p-7">
				<CardTitle className="text-2xl">{"欢迎回来"}!</CardTitle>
			</CardHeader>
			<div className="px-7">
				<DottedSeparator />
			</div>
			<CardContent className="p-7">
				<Form {...form}>
					<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
						<FormField
							name="email"
							control={form.control}
							render={({ field }) => (
								<FormItem>
									<FormControl>
										<Input {...field} type="email" placeholder="邮箱" />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
						<FormField
							name="password"
							control={form.control}
							render={({ field }) => (
								<FormItem>
									<FormControl>
										<Input {...field} type="password" placeholder="密码" />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
						<Button disabled={isPending} size="lg" className="w-full">
							{"登陆"}
						</Button>
					</form>
				</Form>
			</CardContent>
			<div className="px-7">
				<DottedSeparator />
			</div>

			<div className="px-7">
				<DottedSeparator />
			</div>
			<CardContent className="p-7 flex items-center justify-center">
				<p>
					{"没有帐号"}?
					<Button asChild variant={"link"} className="text-base">
						<Link href={SIGN_UP_PATH}>{"注册"}</Link>
					</Button>
				</p>
			</CardContent>
		</Card>
	)
}

export default SignInCard
