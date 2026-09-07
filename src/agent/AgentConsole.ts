import * as readline from 'readline';

import { PlaywrightAgent} from './PlaywrightAgent';


const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});


function askQuestion( question: string): Promise<string> {

    return new Promise((resolve) => {
        rl.question(question, (answer) => {resolve(answer.trim());});
    });
}


async function start() {

    const agent = new PlaywrightAgent();

    console.log('\n================================');
    console.log(' PLAYWRIGHT MCP AI AGENT');
    console.log('================================\n');

    while (true) {

        const request = await askQuestion('What would you like me to do?\n> ');


        if ( request.toLowerCase() === 'exit') {
            console.log('\nShutting down AI Agent.');
            break;
        }

        console.log('\nAgent is working...\n');

        try {
            const result = await agent.run(request);

            console.log('\n================================');
            console.log('FINAL RESPONSE');
            console.log('================================\n');

            console.log(result);
            console.log('');

        } catch (error) {
            console.error('\nAgent failed:');
            console.error(error);
        }
    }

    rl.close();
}


start();