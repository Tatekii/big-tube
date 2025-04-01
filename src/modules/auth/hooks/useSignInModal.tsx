import { useQueryState, parseAsBoolean } from "nuqs"

const useSignInModal = () => {
	const [isOpen, setIsOpen] = useQueryState(
		"sign-in-modal",
		parseAsBoolean.withDefault(false).withOptions({ clearOnDefault: true })
	)

	const open = () => setIsOpen(true)
	const close = () => setIsOpen(false)

	return {
		open,
		close,
		isOpen,
	}
}

export default useSignInModal
