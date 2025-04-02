"use client"

import { z } from "zod"
import Link from "next/link"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form"

import useRegister from "../api/useRegister"
import { registerSchema } from "../schema"

import { SIGN_IN_PATH } from "@/constants"
import { Separator } from "@/components/ui/separator"

const SignUpCard = () => {
	const { mutate, isPending } = useRegister()

	const form = useForm<z.infer<typeof registerSchema>>({
		resolver: zodResolver(registerSchema),
		defaultValues: {
			firstName: "",
			lastName: "",
			email: "",
			password: "",
			password2: "",
		},
	})

	const passwordValue = form.watch("password")

	const onSubmit = (values: z.infer<typeof registerSchema>) => {
		mutate(values)
	}

	return (
		<Card className="w-full h-full md:w-[487px] border-none shadow-none">
			<CardHeader className="flex items-center justify-center text-center p-7">
				<CardTitle className="text-2xl">{"注册"}</CardTitle>
				<CardDescription>
					{"继续注册即代表您同意我们的" + " "}
					<Link href="/privacy">
						<span className="text-blue-700">{"隐私策略"}</span>
					</Link>{" "}
					{"和" + " "}
					<Link href="/terms">
						<span className="text-blue-700">{"用户协议"}</span>
					</Link>
				</CardDescription>
			</CardHeader>
			<div className="px-7">
				<Separator />
			</div>
			<CardContent className="p-7">
				<Form {...form}>
					<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
						<FormField
							name="firstName"
							control={form.control}
							render={({ field }) => (
								<FormItem>
									<FormControl>
										<Input {...field} type="text" placeholder="名" />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
						<FormField
							name="lastName"
							control={form.control}
							render={({ field }) => (
								<FormItem>
									<FormControl>
										<Input {...field} type="text" placeholder="姓" />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
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
						{passwordValue && (
							<FormField
								name="password2"
								control={form.control}
								render={({ field }) => (
									<FormItem>
										<FormControl>
											<Input {...field} type="password" placeholder="再次输入密码" />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
						)}
						<Button disabled={isPending} size="lg" className="w-full">
							{"注册"}
						</Button>
					</form>
				</Form>
			</CardContent>
			<div className="px-7">
				<Separator />
			</div>

			<div className="px-7">
				<Separator />
			</div>
			<CardContent className="p-7 flex items-center justify-center">
				<p>
					{"已经有账号了"}?
					<Link href={SIGN_IN_PATH}>
						<span className="text-blue-700">&nbsp;{"登陆"}</span>
					</Link>
				</p>
			</CardContent>
		</Card>
	)
}

export default SignUpCard
