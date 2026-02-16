import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

type GoogleAuthButtonProps = {
  label: string
  disabled?: boolean
  onClick: () => void
  className?: string
}

function GoogleLogoIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 18 18" className="h-5 w-5 shrink-0">
      <path
        fill="#4285F4"
        d="M17.64 9.2045c0-.638-.0573-1.2518-.1636-1.8409H9v3.4818h4.8441c-.2086 1.125-.8427 2.0782-1.7968 2.7155v2.2582h2.9086c1.7023-1.5673 2.6841-3.8741 2.6841-6.6146z"
      />
      <path
        fill="#34A853"
        d="M9 18c2.43 0 4.4673-.8055 5.9564-2.1805l-2.9086-2.2582c-.8055.54-1.8368.8591-3.0477.8591-2.3441 0-4.3282-1.5832-5.0364-3.71H.9573v2.3318C2.4382 15.9832 5.4818 18 9 18z"
      />
      <path
        fill="#FBBC05"
        d="M3.9636 10.71c-.18-.54-.2836-1.1168-.2836-1.71s.1036-1.17.2836-1.71V4.9582H.9573C.3477 6.1732 0 7.5477 0 9s.3477 2.8268.9573 4.0418L3.9636 10.71z"
      />
      <path
        fill="#EA4335"
        d="M9 3.5795c1.3214 0 2.5077.4541 3.4405 1.3459l2.5814-2.5814C13.4632.8918 11.4268 0 9 0 5.4818 0 2.4382 2.0168.9573 4.9582L3.9636 7.29c.7082-2.1268 2.6923-3.7105 5.0364-3.7105z"
      />
    </svg>
  )
}

export function GoogleAuthButton({ label, disabled, onClick, className }: GoogleAuthButtonProps) {
  return (
    <Button
      type="button"
      variant="outline"
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "h-12 w-full rounded-full border-2 border-[#747775] bg-white px-6 text-base font-medium text-[#1f1f1f] shadow-none hover:bg-[#f8f9fa] hover:text-[#1f1f1f] focus-visible:ring-[#1a73e8]",
        className
      )}
    >
      <GoogleLogoIcon />
      <span className="ml-3">{label}</span>
    </Button>
  )
}
