<template>
  <div class="pt-24 pb-20 px-8 max-w-7xl mx-auto relative z-10">
      <div class="text-center mb-20 animate-slide-in-up">
          <h1 class="text-5xl md:text-6xl font-bold mb-6 text-white tracking-tight">
              Command the <span class="text-transparent bg-clip-text bg-gradient-to-r from-atlas-cyan to-blue-500">Data Cosmos</span>
          </h1>
          <p class="text-xl text-gray-400 max-w-3xl mx-auto">
              Atlas isn't just an ORM. It's a precise instrument for navigating the gravity well of your data.
          </p>
      </div>
      
      <div class="space-y-32">
          <!-- Section 1: ORM & Models (Left Text, Right Code) -->
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div class="order-2 lg:order-1">
                  <div class="inline-block bg-purple-500/10 text-purple-400 px-3 py-1 rounded-full text-xs font-mono mb-4 border border-purple-500/20">Active Record</div>
                  <h2 class="text-3xl font-bold text-white mb-6">Gravity Models</h2>
                  <p class="text-gray-400 mb-6 leading-relaxed">
                      Define your universe using intuitive TypeScript classes. Atlas uses decorators to map your database columns to class properties, giving you full type safety and IDE autocompletion out of the box.
                  </p>
                  <ul class="space-y-3 text-gray-300">
                      <li class="flex items-center gap-3">
                          <svg class="w-5 h-5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" /></svg>
                          Automatic timestamp management
                      </li>
                      <li class="flex items-center gap-3">
                          <svg class="w-5 h-5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" /></svg>
                          Hooks for lifecycle events
                      </li>
                      <li class="flex items-center gap-3">
                          <svg class="w-5 h-5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" /></svg>
                          JSON serialization built-in
                      </li>
                  </ul>
              </div>
              <div class="order-1 lg:order-2 bg-black/40 backdrop-blur border border-white/10 p-2 rounded-xl shadow-2xl hover:border-purple-500/30 transition-colors">
                  <div class="flex items-center gap-2 px-4 py-2 border-b border-white/5 mb-2">
                      <div class="w-3 h-3 rounded-full bg-red-500/20"></div>
                      <div class="w-3 h-3 rounded-full bg-yellow-500/20"></div>
                      <div class="w-3 h-3 rounded-full bg-green-500/20"></div>
                      <span class="ml-2 text-xs text-gray-600 font-mono">User.ts</span>
                  </div>
                  <pre class="p-4 text-sm overflow-x-auto font-mono leading-relaxed">
<span class="text-purple-400">import</span> { Model, column, hasMany } <span class="text-purple-400">from</span> <span class="text-green-300">'@gravito/atlas'</span>

<span class="text-purple-400">export default class</span> <span class="text-yellow-400">User</span> <span class="text-purple-400">extends</span> <span class="text-blue-300">Model</span> {
  <span class="text-purple-400">static</span> tableName = <span class="text-green-300">'users'</span>
  
  <span class="text-blue-300">@column</span>({ isPrimary: <span class="text-orange-300">true</span> })
  <span class="text-purple-400">declare</span> id: <span class="text-yellow-400">number</span>
  
  <span class="text-blue-300">@column</span>()
  <span class="text-purple-400">declare</span> email: <span class="text-yellow-400">string</span>

  <span class="text-blue-300">@hasMany</span>(() => Post)
  <span class="text-purple-400">declare</span> posts: <span class="text-yellow-400">HasMany</span>&lt;<span class="text-purple-400">typeof</span> Post&gt;

  <span class="text-blue-300">@column</span>.<span class="text-blue-300">dateTime</span>({ autoCreate: <span class="text-orange-300">true</span> })
  <span class="text-purple-400">declare</span> createdAt: <span class="text-yellow-400">DateTime</span>
}</pre>
              </div>
          </div>

          <!-- Section 2: Query Builder (Left Code, Right Text) -->
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
               <div class="bg-black/40 backdrop-blur border border-white/10 p-2 rounded-xl shadow-2xl hover:border-atlas-cyan/30 transition-colors">
                  <div class="flex items-center gap-2 px-4 py-2 border-b border-white/5 mb-2">
                       <span class="text-xs text-gray-600 font-mono">Controller.ts</span>
                  </div>
                  <pre class="p-4 text-sm overflow-x-auto font-mono leading-relaxed">
<span class="text-gray-500">// Fluent Chainable API</span>
<span class="text-purple-400">const</span> <span class="text-blue-300">users</span> = <span class="text-purple-400">await</span> <span class="text-yellow-400">User</span>.<span class="text-blue-300">query</span>()
  .<span class="text-blue-300">where</span>(<span class="text-green-300">'isActive'</span>, <span class="text-orange-300">true</span>)
  .<span class="text-blue-300">whereHas</span>(<span class="text-green-300">'posts'</span>, (<span class="text-orange-300">query</span>) => {
    <span class="text-orange-300">query</span>.<span class="text-blue-300">where</span>(<span class="text-green-300">'likes'</span>, <span class="text-pink-400">'>'</span>, <span class="text-orange-300">100</span>)
  })
  .<span class="text-blue-300">orderBy</span>(<span class="text-green-300">'createdAt'</span>, <span class="text-green-300">'desc'</span>)
  .<span class="text-blue-300">limit</span>(<span class="text-orange-300">10</span>)

<span class="text-gray-500">// Or use the DB Facade directly</span>
<span class="text-purple-400">const</span> <span class="text-blue-300">stats</span> = <span class="text-purple-400">await</span> <span class="text-yellow-400">DB</span>
  .<span class="text-blue-300">from</span>(<span class="text-green-300">'access_logs'</span>)
  .<span class="text-blue-300">select</span>(<span class="text-green-300">'region'</span>)
  .<span class="text-blue-300">count</span>(<span class="text-green-300">'*'</span>, <span class="text-green-300">'hits'</span>)
  .<span class="text-blue-300">groupBy</span>(<span class="text-green-300">'region'</span>)</pre>
              </div>
              <div>
                  <div class="inline-block bg-atlas-cyan/10 text-atlas-cyan px-3 py-1 rounded-full text-xs font-mono mb-4 border border-atlas-cyan/20">Query Engine</div>
                  <h2 class="text-3xl font-bold text-white mb-6">Fluent Orbit Builder</h2>
                  <p class="text-gray-400 mb-6 leading-relaxed">
                      Write queries that read like English. The Orbit Query Builder is designed for expressiveness without sacrificing performance. It supports complex joins, subqueries, and eager loading of relationships with zero N+1 issues.
                  </p>
                  <p class="text-gray-400 leading-relaxed border-l-2 border-atlas-cyan pl-4 italic">
                      "It feels like writing plain SQL, but with the superpowers of TypeScript."
                  </p>
              </div>
          </div>

          <!-- Section 3: Migrations (Left Text, Right Code) -->
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div class="order-2 lg:order-1">
                  <div class="inline-block bg-blue-500/10 text-blue-400 px-3 py-1 rounded-full text-xs font-mono mb-4 border border-blue-500/20">Schema Control</div>
                  <h2 class="text-3xl font-bold text-white mb-6">Structural Architect</h2>
                  <p class="text-gray-400 mb-6 leading-relaxed">
                      Databases evolve. Atlas Migrations help you version control your schema changes. Share migrations with your team and deploy changes with confidence using the Atlas CLI.
                  </p>
                  <div class="grid grid-cols-2 gap-4">
                      <div class="bg-blue-500/5 p-4 rounded border border-blue-500/10 hover:bg-blue-500/10 transition-colors">
                          <div class="text-blue-400 font-bold mb-1">Up</div>
                          <div class="text-xs text-gray-500">Deploy changes forward</div>
                      </div>
                      <div class="bg-red-500/5 p-4 rounded border border-red-500/10 hover:bg-red-500/10 transition-colors">
                          <div class="text-red-400 font-bold mb-1">Down</div>
                          <div class="text-xs text-gray-500">Rollback mistakes instantly</div>
                      </div>
                  </div>
              </div>
              <div class="order-1 lg:order-2 bg-black/40 backdrop-blur border border-white/10 p-2 rounded-xl shadow-2xl hover:border-blue-500/30 transition-colors">
                  <div class="flex items-center gap-2 px-4 py-2 border-b border-white/5 mb-2">
                      <span class="text-xs text-gray-600 font-mono">database/migrations/xxx_users.ts</span>
                  </div>
                  <pre class="p-4 text-sm overflow-x-auto font-mono leading-relaxed">
<span class="text-purple-400">import</span> { Schema } <span class="text-purple-400">from</span> <span class="text-green-300">'@gravito/atlas'</span>

<span class="text-purple-400">export async function</span> <span class="text-blue-300">up</span>(schema: <span class="text-yellow-400">Schema</span>) {
  <span class="text-purple-400">await</span> schema.<span class="text-blue-300">createTable</span>(<span class="text-green-300">'users'</span>, (<span class="text-orange-300">table</span>) => {
    <span class="text-orange-300">table</span>.<span class="text-blue-300">increments</span>(<span class="text-green-300">'id'</span>)
    <span class="text-orange-300">table</span>.<span class="text-blue-300">string</span>(<span class="text-green-300">'email'</span>, <span class="text-orange-300">255</span>).<span class="text-blue-300">notNullable</span>().<span class="text-blue-300">unique</span>()
    <span class="text-orange-300">table</span>.<span class="text-blue-300">string</span>(<span class="text-green-300">'password'</span>, <span class="text-orange-300">180</span>).<span class="text-blue-300">notNullable</span>()
    <span class="text-orange-300">table</span>.<span class="text-blue-300">boolean</span>(<span class="text-green-300">'is_active'</span>).<span class="text-blue-300">defaultTo</span>(<span class="text-orange-300">true</span>)
    
    <span class="text-comment text-gray-500">// Foreign Keys</span>
    <span class="text-orange-300">table</span>.<span class="text-blue-300">integer</span>(<span class="text-green-300">'team_id'</span>).<span class="text-blue-300">unsigned</span>().<span class="text-blue-300">references</span>(<span class="text-green-300">'id'</span>).<span class="text-blue-300">inTable</span>(<span class="text-green-300">'teams'</span>)

    <span class="text-orange-300">table</span>.<span class="text-blue-300">timestamps</span>()
  })
}</pre>
              </div>
          </div>
          
          <!-- Section 4: Seeding & Factory (Left Code, Right Text) -->
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
               <div class="bg-black/40 backdrop-blur border border-white/10 p-2 rounded-xl shadow-2xl hover:border-green-500/30 transition-colors">
                  <div class="flex items-center gap-2 px-4 py-2 border-b border-white/5 mb-2">
                       <span class="text-xs text-gray-600 font-mono">database/seeders/UserSeeder.ts</span>
                  </div>
                  <pre class="p-4 text-sm overflow-x-auto font-mono leading-relaxed">
<span class="text-purple-400">import</span> { Factory } <span class="text-purple-400">from</span> <span class="text-green-300">'@gravito/atlas'</span>
<span class="text-purple-400">import</span> User <span class="text-purple-400">from</span> <span class="text-green-300">'@/models/User'</span>

<span class="text-comment text-gray-500">// Define factory blueprint</span>
Factory.<span class="text-blue-300">define</span>(User, ({ <span class="text-orange-300">faker</span> }) => {
  <span class="text-purple-400">return</span> {
    <span class="text-blue-300">email</span>: <span class="text-orange-300">faker</span>.internet.<span class="text-blue-300">email</span>(),
    <span class="text-blue-300">password</span>: <span class="text-green-300">'secret'</span>,
    <span class="text-blue-300">avatarUrl</span>: <span class="text-orange-300">faker</span>.image.<span class="text-blue-300">avatar</span>(),
  }
})

<span class="text-comment text-gray-500">// Run seeder</span>
<span class="text-purple-400">export async function</span> <span class="text-blue-300">run</span>() {
  <span class="text-comment text-gray-500">// Create 50 users with related posts</span>
  <span class="text-purple-400">await</span> Factory.<span class="text-blue-300">model</span>(User)
    .<span class="text-blue-300">with</span>(<span class="text-green-300">'posts'</span>, <span class="text-orange-300">3</span>)
    .<span class="text-blue-300">createMany</span>(<span class="text-orange-300">50</span>)
}</pre>
              </div>
              <div>
                  <div class="inline-block bg-green-500/10 text-green-400 px-3 py-1 rounded-full text-xs font-mono mb-4 border border-green-500/20">Data Terraforming</div>
                  <h2 class="text-3xl font-bold text-white mb-6">Rapid Seeding</h2>
                  <p class="text-gray-400 mb-6 leading-relaxed">
                      Need fake data for testing or local development? Atlas factories allow you to generate massive amounts of realistic data in milliseconds, including complex relationship networks.
                  </p>
              </div>
          </div>
      </div>
  </div>
</template>
