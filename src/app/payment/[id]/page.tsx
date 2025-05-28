import Footer from '@/components/Footer'
import Navbar from '@/components/Navbar'
import PaymentPage from '@/components/PaymentPage'

interface PageProps {
  params: Promise<{
    id: string
  }>
}

export default async function Page({ params }: PageProps) {
  const { id } = await params
  
  return (
    <div>
        <Navbar />
        <PaymentPage orderId={id} />
        <Footer />
    </div>
  )
}
