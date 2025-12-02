import MicrochipLoader from '@/app/components/MicrochipLoader'

export default function Loading() {
    return (
        <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
            <MicrochipLoader text="Loading..." />
        </div>
    )
}
