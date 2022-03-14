function getRandomInt(num) {
    return Math.floor(Math.random() * num);
}

class Set {
    static async createRandomSet(questions, answers) {

        let questionsArray = [];
        let answersArray = [];

        let numOfSets = 0;
        while(questions.length > 0 && numOfSets < 25) {
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

        let badSet = {q: questionsArray, a: answersArray}

        // If there are less than 5 sets, no point in playing the game...
        if(numOfSets < 5) 
            return [false, badSet];

        // Otherwise, if there are an uneven number of sets, make it possible to have 5 categories
        else if (numOfSets % 5 != 0) {
            for(i = 0; i < numOfSets%5; i++) {
                questionsArray.pop();
                answersArray.pop();
            }
        } 

        let set = {q: questionsArray, a: answersArray}
        
        // Return success, question/answer arrays
        return [true, set];
    }
}

module.exports = Set;