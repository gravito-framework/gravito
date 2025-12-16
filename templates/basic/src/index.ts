import { PlanetCore, ConsoleLogger } from 'gravito-core';

// 1. Initialize the Planet Core
const core = new PlanetCore({
    logger: new ConsoleLogger(),
    config: {
        PORT: 3000
    }
});

// 2. Add a simple hook
core.hooks.addAction('app:ready', () => {
    core.logger.info('🪐 Your Gravito Planet is spinning!');
});

// 3. Define routes (Hono style)
core.app.get('/', (c) => {
    return c.json({
        message: 'Welcome to the Galaxy!',
        system: 'Gravito',
        status: 'Operational'
    });
});

// 4. Liftoff!
core.liftoff();
