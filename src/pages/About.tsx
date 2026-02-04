
export default function About() {
    return (
        <div className="bg-white">
            <div className="max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:py-24 lg:px-8">
                <div className="text-center">
                    <h2 className="text-base font-semibold text-blue-600 tracking-wide uppercase">About Us</h2>
                    <p className="mt-1 text-4xl font-extrabold text-gray-900 sm:text-5xl sm:tracking-tight lg:text-6xl">
                        CricTrac
                    </p>
                    <p className="max-w-xl mt-5 mx-auto text-xl text-gray-500">
                        Fixing the identity crisis in cricket with data-backed verification.
                    </p>
                </div>

                <div className="mt-16">
                    <div className="space-y-12 lg:space-y-0 lg:grid lg:grid-cols-3 lg:gap-8">
                        <div className="p-8 bg-gradient-to-br from-white to-blue-50 rounded-2xl shadow-lg border border-gray-100 transform transition-all duration-300 hover:scale-105 hover:-translate-y-2 hover:shadow-xl">
                            <h3 className="text-xl font-bold text-gray-900 mb-4">The Problem</h3>
                            <p className="text-base text-gray-600 leading-relaxed">
                                Age fraud and identity duplication are rampant in grassroots cricket, making it difficult for scouts to trust records.
                            </p>
                        </div>

                        <div className="p-8 bg-gradient-to-br from-white to-blue-50 rounded-2xl shadow-lg border border-gray-100 transform transition-all duration-300 hover:scale-105 hover:-translate-y-2 hover:shadow-xl">
                            <h3 className="text-xl font-bold text-gray-900 mb-4">Our Solution</h3>
                            <p className="text-base text-gray-600 leading-relaxed">
                                A centralized, immutable database of player identities and statistics, verified by local officials and locked on the blockchain.
                            </p>
                        </div>

                        <div className="p-8 bg-gradient-to-br from-white to-blue-50 rounded-2xl shadow-lg border border-gray-100 transform transition-all duration-300 hover:scale-105 hover:-translate-y-2 hover:shadow-xl">
                            <h3 className="text-xl font-bold text-gray-900 mb-4">How It Works</h3>
                            <p className="text-base text-gray-600 leading-relaxed">
                                Players sign up, get verified by officials, and their match data is automatically tracked and displayed on their public profile.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
