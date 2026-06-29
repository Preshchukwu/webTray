import StoreHeader  from "./_components/header"

export default function PublicRoutesLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
   <div>
     <StoreHeader />
    {children}
   </div>
  )
}