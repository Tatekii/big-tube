"use client"

import { Suspense } from "react"
import { useRouter } from "next/navigation"
import { ErrorBoundary } from "react-error-boundary"

import { FilterCarousel } from "@/components/filter-carousel"
import { useTRPC } from "@/trpc/client"
import { useSuspenseQuery } from "@tanstack/react-query"

interface CategoriesSectionProps {
	categoryId?: string
}

export const CategoriesSection = ({ categoryId }: CategoriesSectionProps) => {
	return (
		<Suspense fallback={<CategoriesSectionSkeleton />}>
			<ErrorBoundary fallback={<p>出错了...</p>}>
				<CategoriesSectionSuspense categoryId={categoryId} />
			</ErrorBoundary>
		</Suspense>
	)
}

export const CategoriesSectionSkeleton = () => {
	return <FilterCarousel isLoading data={[]} onSelect={() => {}} />
}

const CategoriesSectionSuspense = ({ categoryId }: CategoriesSectionProps) => {
	const router = useRouter()

	const trpc = useTRPC()

	const query = useSuspenseQuery(trpc.categories.getMany.queryOptions())

	const data = query.data.map((category) => ({
		value: category.id,
		label: category.name,
	}))

	const onSelect = (value: string | null) => {
		const url = new URL(window.location.href)

		if (value) {
			url.searchParams.set("categoryId", value)
		} else {
			url.searchParams.delete("categoryId")
		}

		router.push(url.toString())
	}

	return <FilterCarousel onSelect={onSelect} value={categoryId} data={data} />
}
