const { spawn } = require('child_process');
const path = require('path');

async function scanFootprint(input) {
  const result = {
    score: 0,
    reasons: [],
    metadata: {
      input: input || "",
      inputType: "",
      username: "",
      totalPlatformsFound: 0,
      platformsDetected: [],
      categorySummary: {
        Social: 0,
        Professional: 0,
        Gaming: 0,
        Developer: 0,
        Forum: 0,
        Shopping: 0,
        Other: 0
      },
      exposureLevel: "Minimal",
      totalDataPoints: 0,
      privacyScore: 100,
      sherlockRaw: []
    }
  };

  try {
    if (!input || typeof input !== 'string') {
      result.reasons.push("Invalid or missing input");
      return result;
    }

    const trimmedInput = input.trim().toLowerCase();

    // Step 1 — Extract Username
    if (trimmedInput.includes('@')) {
      result.metadata.inputType = "email";
      result.metadata.username = trimmedInput.split('@')[0];
    } else {
      result.metadata.inputType = "username";
      result.metadata.username = trimmedInput;
    }

    const username = result.metadata.username;

    // Step 2 — Run Sherlock as Child Process
    const pythonPath = path.join(
      __dirname,
      '..',
      'sherlock-env',
      'Scripts',
      'python.exe'
    );

    let sherlockOutput = "";
    let isTimedOut = false;
    let spawnError = false;

    await new Promise((resolve, reject) => {
      let isSettled = false;
      const sherlockProcess = spawn(pythonPath, ['-m', 'sherlock', username, '--print-found']);

      const timeoutId = setTimeout(() => {
        if (!isSettled) {
          isSettled = true;
          isTimedOut = true;
          sherlockProcess.kill();
          result.reasons.push("Scan timed out — partial results returned");
          resolve();
        }
      }, 120000); // 120 seconds

      sherlockProcess.stdout.on('data', (data) => {
        sherlockOutput += data.toString();
      });

      sherlockProcess.stderr.on('data', (data) => {
        // Capture stderr if needed, but not failing process per requirement.
      });

      sherlockProcess.on('close', (code) => {
        if (!isSettled) {
          isSettled = true;
          clearTimeout(timeoutId);
          resolve();
        }
      });

      sherlockProcess.on('error', (err) => {
        if (!isSettled) {
          isSettled = true;
          spawnError = true;
          clearTimeout(timeoutId);
          result.reasons.push("Sherlock environment not found");
          resolve(); 
        }
      });
    });

    if (spawnError) {
      return result;
    }

    if (!sherlockOutput || sherlockOutput.trim().length === 0) {
      if (!isTimedOut) result.reasons.push("No platforms detected");
      return result;
    }

    // Step 3 — Parse Sherlock Output
    const lines = sherlockOutput.split('\n');
    
    for (const line of lines) {
      if (line.startsWith('[+]')) {
        // Looks like: [+] GitHub: https://github.com/username
        const content = line.substring(3).trim();
        const index = content.indexOf(':');
        if (index !== -1) {
          const platform = content.substring(0, index).trim();
          const url = content.substring(index + 1).trim();
          result.metadata.sherlockRaw.push({ platform, url });
          result.metadata.platformsDetected.push(platform);
        }
      }
    }

    result.metadata.totalPlatformsFound = result.metadata.sherlockRaw.length;

    // Step 4 — Categorize Detected Platforms
    const socialPlatforms = ['instagram', 'twitter', 'facebook', 'tiktok', 'snapchat', 'pinterest', 'tumblr', 'mastodon', 'vk', 'weibo'];
    const professionalPlatforms = ['linkedin', 'behance', 'dribbble', 'angellist', 'xing', 'freelancer', 'upwork', 'fiverr'];
    const gamingPlatforms = ['steam', 'xbox', 'playstation', 'twitch', 'roblox', 'minecraft', 'speedrun', 'kongregate', 'newgrounds'];
    const developerPlatforms = ['github', 'gitlab', 'npm', 'stackoverflow', 'hackernews', 'replit', 'codepen', 'dev.to', 'hackmd', 'bugcrowd'];
    const forumPlatforms = ['reddit', 'quora', 'medium', 'producthunt', 'boardgamegeek', 'dailykos'];
    const shoppingPlatforms = ['amazon', 'etsy', 'flipkart', 'ebay'];

    for (let platform of result.metadata.platformsDetected) {
      const p = platform.trim().toLowerCase();
      if (socialPlatforms.includes(p)) {
        result.metadata.categorySummary.Social++;
      } else if (professionalPlatforms.includes(p)) {
        result.metadata.categorySummary.Professional++;
      } else if (gamingPlatforms.includes(p)) {
        result.metadata.categorySummary.Gaming++;
      } else if (developerPlatforms.includes(p)) {
        result.metadata.categorySummary.Developer++;
      } else if (forumPlatforms.includes(p)) {
        result.metadata.categorySummary.Forum++;
      } else if (shoppingPlatforms.includes(p)) {
        result.metadata.categorySummary.Shopping++;
      } else {
        result.metadata.categorySummary.Other++;
      }
    }

    // Step 5 — Calculate Exposure Score
    let score = 0;
    const totalPlatformsFound = result.metadata.totalPlatformsFound;
    score += totalPlatformsFound * 5;

    const { Social, Professional, Gaming, Shopping } = result.metadata.categorySummary;

    if (Social >= 5) {
      score += 25;
    } else if (Social >= 3) {
      score += 15;
    }

    if (Professional >= 1) {
      score += 10;
    }

    if (Gaming >= 2) {
      score += 10;
    }

    if (Shopping >= 1) {
      score += 10;
    }

    if (totalPlatformsFound > 15) {
      score += 15;
    }

    result.score = Math.min(score, 100);

    // Step 6 — Build Reasons Array
    if (totalPlatformsFound === 0) {
      if (!isTimedOut) result.reasons.push("No platforms detected — username may be private or unique");
    } else {
      result.reasons.push(`Found on ${totalPlatformsFound} platforms across the internet`);
      
      const categories = ['Social', 'Professional', 'Gaming', 'Developer', 'Forum', 'Shopping', 'Other'];
      for (const cat of categories) {
        if (result.metadata.categorySummary[cat] > 0) {
          result.reasons.push(`Detected on ${result.metadata.categorySummary[cat]} ${cat} platforms`);
        }
      }

      if (Social >= 3) {
        result.reasons.push("High social media presence increases exposure risk");
      }
      if (Professional >= 1) {
        result.reasons.push("Professional profiles expose work history and contact info");
      }
      if (Gaming >= 2) {
        result.reasons.push("Gaming profiles reveal activity patterns and social connections");
      }
      if (totalPlatformsFound > 10) {
        result.reasons.push(`Extensive digital footprint detected across ${totalPlatformsFound} platforms`);
      }
    }

    // Step 7 — Classify Exposure Level
    let exposureLevel = "Minimal";
    if (totalPlatformsFound >= 13) {
      exposureLevel = "Critical";
    } else if (totalPlatformsFound >= 8) {
      exposureLevel = "High";
    } else if (totalPlatformsFound >= 4) {
      exposureLevel = "Medium";
    } else if (totalPlatformsFound >= 1) {
      exposureLevel = "Low";
    }
    result.metadata.exposureLevel = exposureLevel;

    // Step 8 — Calculate Privacy Score
    result.metadata.privacyScore = 100 - result.score;

    // Step 9 — Set totalDataPoints
    result.metadata.totalDataPoints = totalPlatformsFound;

    return result;

  } catch (error) {
    if (result.reasons.length === 0) {
      result.reasons.push("Execution error during footprint scan");
    }
    return result; 
  }
}

module.exports = { scanFootprint };
