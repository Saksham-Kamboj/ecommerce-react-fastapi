import loadingImg from "@/assets/loading.svg"

export default function PageLoading({ minHeight = "min-h-screen" }) {
  return (
    <div className={`flex items-center justify-center ${minHeight}`}>
      <img src={loadingImg} alt="loading..." className="h-100 w-100" />
    </div>
  )
}
