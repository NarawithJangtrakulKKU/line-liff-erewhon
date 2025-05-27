import Footer from '@/components/Footer'
import Navbar from '@/components/Navbar'
import PaymentPage from '@/components/PaymentPage'

interface PageProps {
  params: {
    id: string
  }
}

export default async function Page({ params }: PageProps) {
  return (
    <div>
        <Navbar />
        <PaymentPage orderId={params.id} />
        <Footer />
    </div>
  )
}
