function getRandomInt(num) {
    return Math.floor(Math.random() * num);
}

class Set {
    static async findLink(link, db) {
        // look up the link in the database
        const set = await db.get("SELECT * FROM sets WHERE link = ?", [link]);
        // if they exist, create and return a new User object with that data
        if (set)
            return true;
        //   createGame();
        // otherwise, return null
        return null;
    }

    static async createRandomSet(questions, answers) {

        let questionsArray = [];
        let answersArray = [];

        let numOfSets = 0;
        while (questions.length > 0 && numOfSets < 25) {
            let randNum = getRandomInt(questions.length);

            // Add set to the new array
            questionsArray.push(questions[randNum]);
            answersArray.push(answers[randNum]);

            // Remove the set from the possible choices
            questions.splice(randNum, 1);
            answers.splice(randNum, 1);

            // Total number of sets between the two arrays
            numOfSets++;
        }

        let set = [];

        // If there are less than 5 sets, no point in playing the game...
        if (numOfSets < 5)
            return [false, set];

        // Otherwise, if there are an uneven number of sets, make it possible to have 5 categories
        else if (numOfSets % 5 != 0) {
            for (let i = 0; i < numOfSets % 5; i++) {
                questionsArray.pop();
                answersArray.pop();
            }
        }

        numOfSets = questionsArray.length;

        // Map each question/answer to a new set array
        for (let i = 0; i < numOfSets; i++) {
            set.push({
                id: i,
                q: questionsArray[i],
                a: answersArray[i]
            });
        }

        // Return success, set array
        return [true, set];
    }
}

module.exports = Set;