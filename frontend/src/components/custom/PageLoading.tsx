import loadingImg from "@/assets/loading.svg"

export default function PageLoading() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <img src={loadingImg} alt="loading..." className="h-100 w-100" />
    </div>
  )
}
