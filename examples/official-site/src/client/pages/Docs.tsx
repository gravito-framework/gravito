import { Head } from '@inertiajs/react';
import Layout from '../components/Layout';

export default function Docs({ title }: { title: string }) {
    return (
        <>
            <Head title={title} />
            <div className="container mx-auto px-6 py-12 max-w-4xl">
                <h1 className="text-4xl font-bold mb-8">Documentation</h1>

                <div className="prose dark:prose-invert max-w-none">
                    <p className="lead text-xl text-gray-600 dark:text-gray-300 mb-8">
                        Gravito is designed to be intuitive. If you know Hono and React, you already know Gravito.
                    </p>

                    <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-xl border border-gray-100 dark:border-gray-700 mb-8">
                        <h3 className="text-lg font-bold mb-4">Quick Start</h3>
                        <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto">
                            <code>bun create gravito-app my-app</code>
                        </pre>
                    </div>

                    <h2 className="text-2xl font-bold mt-12 mb-6">Core Concepts</h2>
                    <ul className="space-y-4 list-disc pl-6 text-gray-700 dark:text-gray-300">
                        <li><strong>PlanetCore:</strong> The micro-kernel that manages the application lifecycle.</li>
                        <li><strong>Orbits:</strong> Infrastructure modules (DB, Auth, etc.) that plug into the core.</li>
                        <li><strong>Satellites:</strong> Your business logic plugins.</li>
                    </ul>
                </div>
            </div>
        </>
    );
}

Docs.layout = (page: React.ReactNode) => <Layout>{page}</Layout>;
