const Users = require("../../models/users");
const PsychUsers = require("../../models/psychUsers");
const PsychQuestions = require("../../models/psychquestions");
const { getAndVerifyUser, sanitize, randomInt } = require("../helperFunctions");
const errors = require("../errors");

// FUNCTIONS/CONSTANTS THAT CLEAN UP QUERIES
unwind = str => ({ $unwind: str });
project = obj => ({ $project: obj });
match = obj => ({ $match: obj });
group = obj => ({ $group: obj });
const psychExists = match({ "psychometricTest.endDate": { $exists: true } });

// RANDOM HELPFUL FUNCTIONS
// adds two numbers
add = (a, b) => a + b;
// gets the sum of a list
sum = values => values.reduce(add, 0);
// gets the average value of a list
mean = values => sum(values) / values.length;
// calculate the variance of a list of values
variance = values => {
    // get the average value of the list
    const average = mean(values);
    // number of values
    const n = values.length;
    // return the sum of the squared deviations from the average
    return values.reduce((sum, value) => sum + Math.pow(value - average, 2), 0) / (n - 1);
};
// return the standard distribution from a list of numbers
standardDeviation = values => Math.sqrt(variance(values));

const outputDescriptions = {
    Sincerity: {
        high:
            "You believe in having relationships that are real. You dislike individuals who are fake and in turn, dislike being fake yourself. If a friend asks you if they have something in their teeth, you’re the type that would tell them without hesitation. People come to you for your advice and opinions, knowing that you’ll say what needs to be said, even if it’s not what they want to hear.",
        med:
            "You enjoy having genuine relationships that are real and deep, keeping a small group of close friends. However, you also tend to form relationships that are more surface level in nature with people that you might need something from in the future. False flattery and the occasional white lie are tools in your belt that you will use if you must.",
        low:
            "You love to play games. Your favorite one? People. You do what it takes to maintain an edge over others, flattering and conning your way through situations to come out on top. You won’t hesitate to say whatever needs to be said to achieve what you want."
    },
    Fairness: {
        high:
            "Your moral compass is impeccable. You would never cheat your way through any situation unless absolutely necessary, if at all, and stealing is out of the question. You dislike those that would take advantage of others for their own personal gain.",
        med:
            "You allow your moral compass to guide many of your decisions, but not all. You dislike those who cheat and avoid cheating yourself, but if the situation calls for it, you’re willing to do so. You would never go out of your way to steal, but would consider it if the situation presented itself and your target deserved it.",
        low:
            "For you, everything is a means to an end. You’ll do what it takes to get ahead, whether it’s cheating or stealing, especially if someone deserves it. Doing something that helps your prosper, especially if you never get caught, is a no-brainer."
    },
    "Greed-Avoidance": {
        high:
            "For you, experiences are worth far more than material goods. Your social status is unimportant, as long as you are happy with who you are. Money? It doesn’t buy your happiness. Being rich and famous? Overrated.",
        med:
            "You enjoy going on the occasional shopping spree and buying nice things. Money doesn’t buy your happiness, but it definitely helps. You like when your reputation precedes you and being a VIP is pretty nice too. But you know that status isn’t everything and experiences are crucial.",
        low:
            "You tend to have the impulsive shopping spree, buying everything that you like. You see something that looks nice? Amazon it. Your dream home? A mansion full of nice cars and expensive things. You want people to know who you are and love feeling like you’re a part of exclusive groups. Appearance is key, and you’re happy when your appearance is pretty damn good."
    },
    Modesty: {
        high:
            "You believe that even if you were the President, you should be treated just like everyone else. You don’t like to have your name in lights, and although you appreciate it when people acknowledge your accomplishments, you rarely advertise them, if ever.",
        med:
            "While you don’t go out of your way to advertise your accomplishments, you definitely like when people acknowledge them. You like when credit is given to you when credit is due, but it’s not the end of the world if it’s not given to you when it should have been. In general, you don’t consider yourself anyone’s “better” but for a select few things you appreciate it when people recognize your skill.",
        low:
            "You love when people acknowledge your accomplishments. While some people might say you’re cocky or brag a lot, you know that you worked hard to achieve what you have. You don’t like when your achievements are overlooked and never overlook others’ achievements either. One of your mottos? Credit is given when credit is due."
    },
    Fearfulness: {
        high:
            "Your body’s well being is a priority to you. You avoid doing things that might get you seriously hurt or injured. Getting a motorcycle is out of the question and skydiving is not on your bucket list -- probably due to your fear of heights.",
        med:
            "While sometimes you enjoy doing things that are considered more physically reckless and dangerous, you avoid going out of your way to do so. You would consider letting a friend take you on a motorcycle ride but would probably never get a motorcycle yourself. And while you could be convinced to skydive, you would prefer to have two feet on the ground.",
        low:
            "You’re an adrenaline seeker. While you may have a random fear of bugs or close spaces, a fear of heights is not one of those. If you haven’t done it already, skydiving is definitely on your bucket list. You’re the type of person that would run into a burning building to save someone without a second thought."
    },
    Anxiety: {
        high:
            "You tend to stress a lot over the little things and constantly wonder why other people don’t. While some people might thrive in high stress environments, you prefer taking things on in small, manageable bites. Whether you turned the lights off or remembered to lock your door are some of the many concerns that are always on your mind throughout the day.",
        med: null,
        low:
            "and collected. Even when things do become difficult, stress is a feeling that you aren’t very familiar with."
    },
    Dependence: {
        high:
            "You are the type of person that works best by having people by your side. No problem is too difficult and no difficulty is a problem as long as you have people to talk to about it and rely on. You’ll go to your friends for a variety of reasons, from advice to help you make difficult decisions or simply just a shoulder to cry on.",
        med:
            "You tend to try to deal with problems and difficulties on your own, but won’t hesitate to involve friends if you need some support. You don’t often find yourself in need of a shoulder to cry on, but if you ever do, you know your friends would be there.",
        low:
            "Self assured, you rarely feel the need to burden others with your problems. Any obstacle that comes up in your life, you can deal with on your own. While there might be one or two people that you go to when you need to talk to someone, you rarely do so. Some might consider you emotionally distant, but you know that it’s just because you’re able to deal with problems yourself."
    },
    Sentimentality: {
        high:
            "You’re the type of person that gets very emotional at anything that involves emotion. Sad Facebook video? Tears. Happy ending to a movie? Tears of joy. Weddings? Tears. While others might think that you’re too emotional, they don’t understand. You have an extremely strong bond with other people and animals and sympathy and empathy beyond what many others are capable of.",
        med:
            "While you don’t get emotional at everything that’s sad or happy like some people, you can still have your moments, although it may take a lot. While some may cry multiple times during a sad movie, you might only cry once, if at all, and probably only at the part where the dog dies. Good byes tend to be more mellow in nature, but with a select few friends, tears will definitely flow.",
        low:
            "You’re not the greatest at good-byes. It’s not because you won’t miss the person or anything, you just don’t get as emotional as others. Some might think you’re distant or cold, but you’re not emotionless, it just takes a lot to evoke visible sadness out of you. Sad movies do make you sad, just nowhere near the point of tears like they would for many others."
    },
    "Social Self Esteem": {
        high:
            "You have a confidence in yourself that many others lack. When it comes to difficult situations, you know that no matter what, you’ll make it to the other side. This self-confidence naturally draws people towards you, strangers and friends alike, and allows for greater ease in social situations.",
        med:
            "Like many people, your confidence in yourself is entirely dependent on the situation. If you are with friends and people that you know like you, you can have a confidence that is almost surprising to yourself. Yet, on the flip side, in situations that are novel, you tend to stay on the quieter side. Regardless, even in situations where you are less confident, once people get to know you, your likeable qualities shine.",
        low:
            "Most times, if not all, you lack confidence. This lack of confidence tends to stem from a belief that you aren’t anything special and most people have more to offer than you. However, you overlook your own unique and likeable qualities, in favour of the ones that you believe to be dislikeable. But they are one in the same. While you might see yourself as shy and unpopular, others may see you as reserved, calm and someone with hidden depths."
    },
    "Social Boldness": {
        high:
            "You’re a natural leader. You thrive most in positions where you’re able to take charge. Even in situations where there is no formal leader, people tend to look to you for guidance and naturally follow your cues. If a situation were to spiral out of control, you would be the first one to step up to the plate, and others would gladly let you.",
        med:
            "You have inherent leadership ability but most of the time prefer for others to take the lead. If a situation were to dissolve utter chaos, you would be willing to step up to the plate, but only if no one else will. While taking the back seat isn’t your preferred action, neither is leading the charge unless it’s necessary.",
        low:
            "You have a tendency to avoid leadership roles. And while some, including yourself, may believe this is due to a lack of confidence in leading the charge, it’s because your talents are best utilized in a support role. A team cannot function without individuals like you and you are crucial for any teams success, filling roles that leader types cannot do."
    },
    Sociability: {
        high:
            "Navigating social situations is one of your many talents. People naturally gravitate towards you and find many aspects of your personality likeable. You thrive on being around people, constantly looking for reasons to celebrate or spend time with friends. You dislike being alone as socializing is your life blood.",
        med:
            "Like many people, you don’t fit in either of the categories known as “extroverted” or “introverted”. You enjoy spending time and socializing with friends, but highly value alone time as well. Being alone too long and often puts you into a saddened state, but being around people too much drains you. It’s a balancing act, and often when deciding whether to go out with friends or not, it’s a very in the moment decision.",
        low:
            "You proposer best on your own. Being around people often drains you, and while you do enjoy people’s company, after a certain point you need to be alone to recharge. It allows for you to do what you want, without worrying about others, and reflect by yourself. While some may see you as shy or even antisocial, you know it’s not true, you simply prefer for others to make introductions first."
    },
    Forgiveness: {
        high:
            "You’re the type of person that easily forgives. Even if someone has wronged you in the past, you see the good in others and believe they always deserve another chance. As such, you are slow to judge others and always give them the benefit of the doubt. You’re more likely to attribute someone doing something negative as a slip up, rather than a fault in their character.",
        med:
            "Like many others, you have a line of forgiveness. Once that line is crossed, forgiving and forgetting is off the table, but it takes a lot to cross it. If friends wrong you, you’re more likely to attribute it as a slip up rather than a fault in their character. However, with strangers, you have a much smaller range of tolerance, and while you may not be quick to judge, you find it much harder to forgive strangers for wronging you.",
        low:
            "Many others might think you’re critical or judgemental. And while you are quick to judge, you know it’s because you’re a good judge of character and can read people better than most others. As such, if someone has wronged you, you often hold a grudge and will be extremely reluctant to forgive, as you know they are likely to do something like that again in the future."
    },
    Flexibility: {
        high:
            "You are the bringer of peace. When things get to heated, you’re often the one to compromise, knowing that most times it’s just not worth it to argue. You’re always willing to hear others out and make sure their opinions are considered.",
        med:
            "Like most people, you try to avoid arguments. And while it takes a lot to push you over the edge, you still have an edge and aren’t afraid to bite. You will always hear others opinions and value their thoughts, but will stand by yours if you know you are right.",
        low:
            "You are steadfast in standing by your beliefs and values. If you believe or know you are right, no one can change your mind. But being stubborn as a mule isn’t a bad thing, it shows you will always fight for your side and that you are someone that can be relied upon to carry something through."
    },
    Organization: {
        high:
            "You live by order. Everything must be neat and organized, planned and laid out. You can’t stand messes and like to tackle tasks with a structured methodology. Nothing is ever out of place, not on your watch.",
        med:
            "You prefer a balance between order and chaos -- organized chaos. While some of your spaces might be messy, you know where everything is. And they never get too messy, as even you can’t stand that. You tend to go through cycles, cleaning, letting your spaces get messy, then cleaning again. This applies to everything from how you work, to your computer desktop, to your room.",
        low:
            "You tend to have spaces that other people may consider extremely messy. However, you tend to know exactly where everything is, and actually find yourself lost if everything is neat and organized. It’s simply how you function best."
    },
    Perfectionism: {
        high:
            "Ever the perfectionist, you make sure every detail is exactly the way you want it. Double checking is never enough, and you can’t stand when you think you’ve made a mistake. You push yourself to make everything you do the very best and always strive to improve, because sometimes the best just isn’t good enough.",
        med:
            "When possible, you strive for perfection, but understand it’s unrealistic to think you can always be perfect. When time is of the essence, you won’t hesitate to sacrifice the details because you know that sometimes, the details just aren’t that important.",
        low:
            "You strive for efficiency. While others waste time doing more than is necessary, you know you can get ahead by doing what is needed and moving on to the next ask. Although sometimes the efficiency mentality leads to mistakes, the overall benefits of being efficient outweighs the risks."
    },
    Prudence: {
        high:
            "Everything needs a plan. You believe that there is a proper way to do most things and that you should always think carefully before you act. You rarely let impulses guide you, preferring to think through everything.",
        med:
            "While you acknowledge that plans are often beneficial and sometimes even necessary, you understand that living life by a plan isn’t always the way to go. Sometimes you just have to live in the moment, going with what you feel rather than what you think. It’s a balance between planning and impulse.",
        low:
            "Impulsive. That word embodies you. You love to live life in the moment more than anything, going with your gut feeling rather than planning things out. Sometimes structure and planning can help, but for the most part, going with what you feel in the moment is the way to go. Only when you live life on the edge do you feel like you’re truly living."
    },
    "Aesthetic Appreciation": {
        high:
            "You appreciate art and nature more than most others. Where others might be bored out of their minds in art museums, you find them fascinating and can lose yourself in art. You are the modern embodiment of the Renaissance, appreciating classical art, music and theatre and the world around you.",
        med: null,
        low: null
    },
    Inquisitiveness: {
        high:
            "Ever curious, you constantly wonder about everything around you. You love the sciences and the way they are able to explain why things happen. You know that all your questions could never be answered, but you’ll try your best to find answers for them. This curiosity in everything manifests itself in an urge to travel, giving you an indescribable wanderlust.",
        med: null,
        low: null
    }
};

// get distribution and stats for each factor
async function GET_factors(req, res, next) {
    const { site, userId, verificationToken } = sanitize(req.query);

    // get the user requesting the info
    try {
        var user = await getAndVerifyUser(userId, verificationToken);
    } catch (getUserError) {
        return res.status(500).send({ message: errors.SERVER_ERROR });
    }
    if (!user.admin) {
        return res.status(403).send({ message: errors.PERMISSIONS_ERROR });
    }

    // aggregation to get all factors
    const factorsAggregation = [
        // only want the users who have completed the psych test
        psychExists,
        // make every user object into { factors: [factor] }
        project({ _id: 0, factors: "$psychometricTest.factors" }),
        // make every factor its own object with its name and score
        unwind("$factors"),
        // only need the name and score of each factor
        project({ name: "$factors.name", score: "$factors.score" })
    ];

    // get all the factors
    try {
        let insightsFactors = ["All", "Insights"].includes(site)
            ? await Users.aggregate(factorsAggregation)
            : [];

        let learningFactors = ["All", "Learning"].includes(site)
            ? await PsychUsers.aggregate(factorsAggregation)
            : [];

        var allFactors = insightsFactors.concat(learningFactors);
    } catch (e) {
        console.log("Error getting factor data: ", e);
        return res.status(500).send({ message: "Error getting data :(" });
    }

    // go through each factor, group factors by factor name
    let factorArraysObj = makeFactorArraysObj(allFactors);

    // an array that will contain the factors that will be returned to the front end
    let newFactorObjs = [];

    // go through each factor to make the returnable factor array
    Object.keys(factorArraysObj).forEach(factorName => {
        // get the number of candidates who have this factor
        const n = factorArraysObj[factorName].length;
        // calculate the average score for the factor
        const average = mean(factorArraysObj[factorName]);
        // calculate the standard deviation for the factor
        const stdDev = standardDeviation(factorArraysObj[factorName]);

        // make the data points of the ranges - [ { name: "-4.75", quantity: 80 }, ... ]
        const dataPoints = makeRanges(factorArraysObj[factorName], -5, 5, 0.5);

        // add the new info to the list of objects to return
        newFactorObjs.push({ name: factorName, n, average, stdDev, dataPoints });
    });

    // sort the factors by name
    newFactorObjs = newFactorObjs.sort((f1, f2) => {
        if (f1.name > f2.name) return 1;
        else if (f1.name < f2.name) return -1;
        else return 0;
    });

    return res.status(200).send({ factors: newFactorObjs });
}

// get distribution and stats for each facet
async function GET_facets(req, res, next) {
    const { site, userId, verificationToken } = sanitize(req.query);

    // get the user requesting the info
    try {
        var user = await getAndVerifyUser(userId, verificationToken);
    } catch (getUserError) {
        return res.status(500).send({ message: errors.SERVER_ERROR });
    }
    if (!user.admin) {
        return res.status(403).send({ message: errors.PERMISSIONS_ERROR });
    }

    // gets a list of facets that each have a list of instances of that facet's responses
    const facetsAggregation = [
        // only want the users who have completed the psych test
        psychExists,
        // make every user object into { factors: [factor] }
        project({ _id: 0, factors: "$psychometricTest.factors" }),
        // make every factor its own object with its name and score
        unwind("$factors"),
        // only need the facets of each factor
        project({ facet: "$factors.facets" }),
        // make every facet its own object
        unwind("$facet"),
        // group these facets by name and make an array of { score, responses } objects
        group({
            _id: { name: "$facet.name" },
            users: { $push: { score: "$facet.score", responses: "$facet.responses" } }
        })
    ];

    // gets all the questions that could be answered and all the facets
    try {
        var questions = await PsychQuestions.find({});

        let insightsFacets = ["All", "Insights"].includes(site)
            ? await Users.aggregate(facetsAggregation)
            : [];

        let learningFacets = ["All", "Learning"].includes(site)
            ? await PsychUsers.aggregate(facetsAggregation)
            : [];

        var facets = [];

        // if getting data from both sites, have to combine the facets
        if (site === "All") {
            // make an object that will store "facetName": usersArray
            let facetsTable = {};
            // add the usersArrays for insights facets and learning facets
            insightsFacets.forEach(iFacet => {
                facetsTable[iFacet._id.name] = iFacet.users;
            });
            learningFacets.forEach(lFacet => {
                if (!facetsTable[lFacet._id.name]) {
                    facetsTable[lFacet._id.name] = [];
                }
                facetsTable[lFacet._id.name] = facetsTable[lFacet._id.name].concat(lFacet.users);
            });
            // make the object an array with same format as initial return values from Promises
            Object.keys(facetsTable).forEach(facetName => {
                facets.push({ _id: { name: facetName }, users: facetsTable[facetName] });
            });
        }
        // otherwise just return whichever array has values
        else {
            facets = insightsFacets.concat(learningFacets);
        }
    } catch (e) {
        console.log("Error getting question data: ", e);
        return res.status(500).send({ message: "Error getting data :(" });
    }

    // make an object out of the questions for easy access
    let questionsObj = {};
    questions.forEach(q => (questionsObj[q._id.toString()] = q));

    // the facet objects that will be returned to the front end
    let facetObjs = [];

    // go through each facet so we can measure its question's stats and chronbach's alpha
    facets.forEach(facet => {
        // remove users who don't have scores for this factor
        const users = facet.users.filter(user => typeof user.score === "number");
        // a list of all users' scores on this facet
        const facetScores = users.map(user => user.score);
        // so we can make a list of lists of question scores
        let qScoresObj = {};
        // go through each user that had a score in this facet
        users.forEach(user => {
            // go through the user's responses to each question from the facet
            user.responses.forEach(response => {
                if (qScoresObj[response.answeredId] === undefined) {
                    qScoresObj[response.answeredId] = [];
                }
                // add the user's responses
                qScoresObj[response.answeredId].push(response.answer);
            });
        });
        // convert the questions scores object into an array
        const qScores = Object.keys(qScoresObj).map(qId => qScoresObj[qId]);

        // measure chronbach's alpha (inter reliability) of the facet
        const cAlpha = chronbachsAlpha(facetScores, qScores, true);

        // get the number of candidates who have this facet
        const n = facetScores.length;
        // calculate the average score for the facet
        const average = mean(facetScores);
        // calculate the standard deviation for the facet
        const stdDev = standardDeviation(facetScores);

        // make the data points of the ranges - [ { name: "-4.75", quantity: 80 }, ... ]
        const dataPoints = makeRanges(facetScores, -5, 5, 0.5);

        // add the new info to the list of objects to return
        facetObjs.push({ name: facet._id.name, n, interRel: cAlpha, average, stdDev, dataPoints });
    });

    return res.status(200).send({ facets: facetObjs });
}

// get stats for the questions pertaining to each facet
async function GET_questions(req, res, next) {
    const { site, userId, verificationToken } = sanitize(req.query);

    // get the user requesting the info
    try {
        var user = await getAndVerifyUser(userId, verificationToken);
    } catch (getUserError) {
        return res.status(500).send({ message: errors.SERVER_ERROR });
    }
    if (!user.admin) {
        return res.status(403).send({ message: errors.PERMISSIONS_ERROR });
    }

    // gets a list of facets that each have a list of instances of that facet's responses
    const facetsAggregation = [
        // only want the users who have completed the psych test
        psychExists,
        // make every user object into { factors: [factor] }
        project({ _id: 0, factors: "$psychometricTest.factors" }),
        // make every factor its own object with its name and score
        unwind("$factors"),
        // only need the facets of each factor
        project({ facet: "$factors.facets", factorName: "$factors.name" }),
        // make every facet its own object
        unwind("$facet"),
        // group these facets by name and make an array of { score, responses } objects
        group({
            _id: { name: "$facet.name", factorName: "$factorName" },
            users: { $push: { score: "$facet.score", responses: "$facet.responses" } }
        })
    ];

    // gets all the questions that could be answered and all the facets
    try {
        var questions = await PsychQuestions.find({});

        let insightsFacets = ["All", "Insights"].includes(site)
            ? await Users.aggregate(facetsAggregation)
            : [];

        let learningFacets = ["All", "Learning"].includes(site)
            ? await PsychUsers.aggregate(facetsAggregation)
            : [];

        var facets = [];

        // if getting data from both sites, have to combine the facets
        if (site === "All") {
            // make an object that will store "facetName": usersArray
            let facetsObj = {};
            // add the usersArrays for insights facets and learning facets
            insightsFacets.forEach(iFacet => {
                facetsObj[iFacet._id.name] = { _id: iFacet._id, users: iFacet.users };
                facetsObj[iFacet._id.name].users = iFacet.users;
            });
            learningFacets.forEach(lFacet => {
                if (!facetsObj[lFacet._id.name]) {
                    facetsObj[lFacet._id.name] = { _id: lFacet._id, users: [] };
                }
                facetsObj[lFacet._id.name].users = facetsObj[lFacet._id.name].users.concat(
                    lFacet.users
                );
            });
            // make the object an array with same format as initial return values from Promises
            Object.keys(facetsObj).forEach(facetName => {
                facets.push({ _id: facetsObj[facetName]._id, users: facetsObj[facetName].users });
            });
        }
        // otherwise just return whichever array has values
        else {
            facets = insightsFacets.concat(learningFacets);
        }
    } catch (e) {
        console.log("Error getting question data: ", e);
        return res.status(500).send({ message: "Error getting data :(" });
    }

    // make an object out of the questions for easy access
    let questionsObj = {};
    questions.forEach(q => (questionsObj[q._id.toString()] = q));

    // the array to store the objects that will be returned
    let questionsToReturn = [];

    // go through each facet so we can measure its question's stats and chronbach's alpha
    facets.forEach(facet => {
        // remove users who don't have scores for this factor
        const users = facet.users.filter(user => typeof user.score === "number");
        // a list of all users' scores on this facet multiplied by k (for chronbach's alpha)
        const facetScores = users.map(user => user.score);
        // so we can make a list of lists of question scores
        let qScoresObj = {};
        // go through each user that had a score in this facet
        users.forEach(user => {
            // go through the user's responses to each question from the facet
            user.responses.forEach(response => {
                if (qScoresObj[response.answeredId] === undefined) {
                    qScoresObj[response.answeredId] = {
                        questionAnswers: [],
                        facetScoresWithoutQuestion: []
                    };
                }
                const numQuestions = user.responses.length;
                // add the user's response
                qScoresObj[response.answeredId].questionAnswers.push(response.answer);

                // if the score is inverted, treat it as its inverse (*-1)
                const multiplier = response.invertScore ? -1 : 1;
                // figure out what the facet score would be without this question
                qScoresObj[response.answeredId].facetScoresWithoutQuestion.push(
                    (user.score * numQuestions - multiplier * response.answer) / (numQuestions - 1)
                );
            });
        });
        // convert the questions scores object into a 2d array
        const qScores = Object.keys(qScoresObj).map(qId => qScoresObj[qId].questionAnswers);

        // measure chronbach's alpha (inter reliability) of the facet
        const cAlpha = chronbachsAlpha(facetScores, qScores, true);

        Object.keys(qScoresObj).forEach(qId => {
            // measure the chronbach's alpha of the facet without the question
            // make a 2d array of question answers that doesn't include this question
            const questionScoresWithoutQuestion = Object.keys(qScoresObj)
                // filter out this question
                .filter(otherQId => otherQId !== qId)
                // just get the value of the answer to the question
                .map(otherQId => qScoresObj[otherQId].questionAnswers);

            const shouldLog = qId.toString() === "5aff0b612689cb00e45ce2fb";
            // calculate the modified facet's chronbach's alpha
            const cAlphaWithoutQuestion = chronbachsAlpha(
                qScoresObj[qId].facetScoresWithoutQuestion,
                questionScoresWithoutQuestion,
                true
            );

            // info about the question (body of the question, right option, left option)
            const questionInfo = questionsObj[qId];

            // this is what will be received by the front end
            questionsToReturn.push({
                question: questionInfo.body,
                rightOption: questionInfo.rightOption,
                leftOption: questionInfo.leftOption,
                facetAlpha: cAlpha,
                cAlphaWithoutQuestion,
                average: mean(qScoresObj[qId].questionAnswers),
                stdDev: standardDeviation(qScoresObj[qId].questionAnswers),
                factor: facet._id.factorName,
                facet: facet._id.name
            });
        });
    });

    return res.status(200).send({ questions: questionsToReturn });
}

// get stats for each output (Learning only)
async function GET_outputs(req, res, next) {
    const { site, userId, verificationToken } = sanitize(req.query);

    // get the user requesting the info
    try {
        var user = await getAndVerifyUser(userId, verificationToken);
    } catch (getUserError) {
        return res.status(500).send({ message: errors.SERVER_ERROR });
    }
    if (!user.admin) {
        return res.status(403).send({ message: errors.PERMISSIONS_ERROR });
    }

    // no outputs on moonshot insights
    if (site === "Insights") {
        return res.status(200).send({ outputs: [] });
    }

    const facetsAggregation = [
        // only want the users who have completed the psych test
        psychExists,
        // make every user object into { factors: [factor] }
        project({ _id: 0, factors: "$psychometricTest.factors" }),
        // make every factor its own object with its name and score
        unwind("$factors"),
        // only need the facets of each factor
        project({ facet: "$factors.facets" }),
        // make every facet its own object
        unwind("$facet"),
        // group these facets by name and make an array of { score, describesMe } objects
        group({
            _id: { name: "$facet.name" },
            instances: { $push: { score: "$facet.score", describesMe: "$facet.describesMe" } }
        })
    ];

    // get data for every facet
    try {
        var facets = await PsychUsers.aggregate(facetsAggregation);
    } catch (e) {
        console.log("Error getting data for outputs: ", e);
        return res.status(500).send({ message: "Error getting your data :(" });
    }

    const levels = ["high", "med", "low"];
    const outputs = facets.map(facet => {
        let output = { name: facet._id.name };

        // if this facet doesn't have a corresponding output
        if (!outputDescriptions[output.name]) {
            output.high = { text: "no output" };
            output.med = { text: "no output" };
            output.low = { text: "no output" };
        }
        // if this facet DOES have a corresponding output
        else {
            // assign initial values for counts for each facet level
            levels.forEach(level => {
                output[level] = {
                    text: outputDescriptions[output.name][level],
                    Yes: 0,
                    Neutral: 0,
                    No: 0,
                    n: 0,
                    responded: 0
                };
            });
            facet.instances.forEach(instance => {
                let calculatedLevel = "low";
                if (instance.score > -3) {
                    calculatedLevel = "med";
                }
                if (instance.score >= 3) {
                    calculatedLevel = "high";
                }
                if (["Yes", "Neutral", "No"].includes(instance.describesMe)) {
                    // increase the "Yes", "No", or "Neutral" count for the facet level
                    output[calculatedLevel][instance.describesMe]++;
                    // increase the count of people who responded to the output
                    output[calculatedLevel].responded++;
                }
                // increase the count of people who had this level
                output[calculatedLevel].n++;
            });

            // calculate final values for each facet level
            levels.forEach(level => {
                const oLvl = output[level];
                const r = oLvl.responded;
                const { n } = oLvl;
                output[level].disagree = oLvl.n === 0 ? "" : oLvl.No / r;
                output[level].neutral = oLvl.n === 0 ? "" : oLvl.Neutral / r;
                output[level].agree = oLvl.n === 0 ? "" : oLvl.Yes / r;
                output[level].proportion =
                    facet.instances.length === "" ? 0 : n / facet.instances.length;
            });
        }

        return output;
    });

    // high, neutral, agree = number of people with that answer (in this score range) / number of people in this score range
    // proportion = number of people in this score range / number of people in all score ranges for this facet
    // n = number of people in all score ranges for this facet

    // const outputs = [
    //     {
    //         name: "Sincerity",
    //         high: {
    //             text: "you dingle",
    //             disagree: 0.05,
    //             neutral: 0.12,
    //             agree: 0.83,
    //             proportion: 0.14,
    //             n: 403
    //         },
    //         med: {
    //             text: "you dangle",
    //             disagree: 0.05,
    //             neutral: 0.12,
    //             agree: 0.83,
    //             proportion: 0.14,
    //             n: 403
    //         },
    //         low: {
    //             text: "you dwong",
    //             disagree: 0.05,
    //             neutral: 0.12,
    //             agree: 0.83,
    //             proportion: 0.14,
    //             n: 403
    //         }
    //     }
    // ];

    return res.status(200).send({ outputs });
}

// get data on individual users for a scatter plot comparing to factors/facets
async function GET_scatter(req, res, next) {
    const { site, facNames, facType, userId, verificationToken } = sanitize(req.query);

    // get the user requesting the info
    try {
        var currentUser = await getAndVerifyUser(userId, verificationToken);
    } catch (getUserError) {
        return res.status(500).send({ message: errors.SERVER_ERROR });
    }
    if (!currentUser.admin) {
        return res.status(403).send({ message: errors.PERMISSIONS_ERROR });
    }

    // check for invalid arguments
    if (facNames.length !== 2) {
        return res.status(400).send({ message: "Can only compare 2 factors/facets." });
    }

    // get all the users
    try {
        const query = { "psychometricTest.endDate": { $exists: true } };
        const select =
            "psychometricTest.factors.score psychometricTest.factors.name \
            psychometricTest.factors.facets.name psychometricTest.factors.facets.score";

        let insightsUsers = ["All", "Insights"].includes(site)
            ? await Users.find(query).select(select)
            : [];

        let learningUsers = ["All", "Learning"].includes(site)
            ? await PsychUsers.find(query).select(select)
            : [];

        var users = insightsUsers.concat(learningUsers);
    } catch (e) {
        console.log("Error getting scatter data: ", e);
        return res.status(500).send({ message: errors.SERVER_ERROR });
    }

    // get a data point from each user
    let points = users.map(user => {
        // if using factors, make the facs array be all the factors
        if (facType === "factors") {
            var userFacs = user.psychometricTest.factors;
        }
        // if using facets, make it all be facets
        else {
            var userFacs = [];
            user.psychometricTest.factors.forEach(factor => {
                factor.facets.forEach(facet => userFacs.push(facet));
            });
        }

        const fac1 = userFacs.find(f => f.name === facNames[0]);
        const fac2 = userFacs.find(f => f.name === facNames[1]);

        return {
            x: fac1 ? fac1.score : null,
            y: fac2 ? fac2.score : null
        };
    });

    // filter out any null data points
    points = points.filter(p => typeof p.x === "number" && typeof p.y === "number");

    // find the correlation coefficient
    const correlation = correlationCoefficient(points);

    // find the best fit line
    const { slope, intercept } = bestFitLine(points);

    // const points = [{ x: 1, y: 5 }, { x: 2.4, y: -3 }, { x: -4.6, y: 5 }];
    const bflPoints = lineBoundaryPoints(slope, intercept, -6, 6, -6, 6);

    // make sure the x and y names are correct
    const x = facNames[0];
    const y = facNames[1];

    const scatter = { points, bflPoints, x, y, slope, intercept, correlation };

    return res.status(200).send({ scatter });
}

// find the correlation between two variables
// points = [ {x: NUMBER, y: NUMBER}, ... ]
function correlationCoefficient(points) {
    const n = points.length;
    const sumX = sum(points.map(p => p.x));
    const sumY = sum(points.map(p => p.y));
    const sumXY = sum(points.map(p => p.x * p.y));
    const sumXSquared = sum(points.map(p => p.x * p.x));
    const sumYSquared = sum(points.map(p => p.y * p.y));

    const numerator = n * sumXY - sumX * sumY;
    const denominator = Math.sqrt(
        (n * sumXSquared - sumX * sumX) * (n * sumYSquared - sumY * sumY)
    );

    return numerator / denominator;
}

// find the slope and intercept of the best fit line of two variables
// points = [ {x: NUMBER, y: NUMBER}, ... ]
function bestFitLine(points) {
    const meanX = mean(points.map(p => p.x));
    const meanY = mean(points.map(p => p.y));

    const rise = sum(points.map(p => (p.x - meanX) * (p.y - meanY)));
    const run = sum(points.map(p => Math.pow(p.x - meanX, 2)));
    const slope = rise / run;
    const intercept = meanY - slope * meanX;

    return { slope, intercept };
}

// get bounding points within an x and y range for any y-intercept form function
function lineBoundaryPoints(slope, intercept, xLeft, xRight, yBottom, yTop) {
    // the function using the given slope and intercept
    f = x => slope * x + intercept;
    fInv = y => (y - intercept) / slope;

    const fxLeft = f(xLeft);
    const fxRight = f(xRight);
    const fInvyBottom = fInv(yBottom);
    const fInvyTop = fInv(yTop);

    // if f(minimum x wanted) is within y range
    if (fxLeft >= yBottom && fxLeft <= yTop) {
        var xMin = xLeft;
        var yMin = fxLeft;
    }
    // if f(minimum x wanted) is outside of the y range, base x on y instead
    else {
        var xMin = fInv(yBottom);
        var yMin = yBottom;
    }

    // if f(maximum x wanted) is within y range
    if (fxRight >= yBottom && fxRight <= yTop) {
        var xMax = xRight;
        var yMax = fxRight;
    }
    // if f(minimum x wanted) is outside of the y range, base x on y instead
    else {
        var xMax = fInv(yTop);
        var yMax = yTop;
    }

    return [{ x: xMin, y: yMin }, { x: xMax, y: yMax }];
}

// calculate chronbach's alpha (inter reliability)
// scores = [ totalScore ] (array of scores received for this facet)
// items = [ [ itemScore ] ] (array of scores for each question)
// multiplyScoresByK = Boolean, true if your scores are the average of the item responses
function chronbachsAlpha(scores, items, multiplyScoresByK) {
    // number of items
    const k = items.length;
    // number of items / (number of items - 1)
    const kScalar = k / (k - 1);

    // get a list of the variances between users on each question
    // (variance within the question across the sample)
    let itemsVariances = items.map(itemAnswers => variance(itemAnswers));
    // sum of those variances
    const itemsVarianceSum = sum(itemsVariances);

    // multiply scores by k if wanted
    if (multiplyScoresByK) {
        scores = scores.map(score => score * k);
    }

    // variance between scores different test takers got for the facet
    let scoresVariance = variance(scores);
    // sum of variances within questions / variances in facet scores
    const varianceFraction = itemsVarianceSum / scoresVariance;

    // final chronbach's alpha
    return kScalar * (1 - varianceFraction);
}

// make the data points of the ranges - [ { name: "-4.75", quantity: 80 }, ... ]
function makeRanges(values, low, high, step) {
    // create the groups - { name: "-3", quantity: 20 }
    const groups = groupCountsBy(values, rangeGroupFunction, low, high - step, step);
    // sort the groups so that -5 is last and 4 is first
    let dataPoints = groups.sort((a, b) => a.name - b.name);
    // make sure every value range is represented, even if there are no data points there
    dataPoints = addMissingRanges(dataPoints, low, high - step, step);
    // add the step/2 so the groupValues are the average of the two end points
    return dataPoints.map(p => ({
        name: (parseFloat(p.name, 10) + step / 2).toString(),
        quantity: p.quantity
    }));
}

// function to round value down to its nearest group
function rangeGroupFunction(value, low, high, step) {
    // divide the value by the step before rounding so we can get a bigger range
    // (step will usually be < 1 and > 0)
    let groupValue = Math.floor(value / step);
    // get the actual group value
    groupValue *= step;
    // if the groupValue is bigger than the high or lower than the low, make it the high or low
    if (groupValue > high) {
        groupValue = high;
    } else if (groupValue < low) {
        groupValue = low;
    }

    return groupValue;
}

// returns an object like this:
// { "Honesty-Humility": { values: [1.2, -.9, ...] } }
function makeFactorArraysObj(factors) {
    let factorObjs = {};
    factors.forEach(factor => {
        // check that the factor is valid
        if (factor.name && factor.score) {
            // if the array for this factor doesn't exist already, initialize it
            if (!factorObjs[factor.name]) {
                factorObjs[factor.name] = [];
            }
            // add the factor score to the list of scores
            factorObjs[factor.name].push(factor.score);
        }
    });

    return factorObjs;
}

// given an array with ranges of data, add in any that are missing
// e.g. array: [{name: -1, quantity: 3}, {name: 1, quantity: 2}]
// addMissingRanges(array, -1, 1) =>
//      [{name: "-1", quantity: 3}, {name: "0", quantity: 0}, {name: "1", quantity: 2}]
function addMissingRanges(array, low, high, step) {
    let rangeIdx = 0;
    for (let rangeStart = low; rangeStart <= high; rangeStart += step) {
        if (array[rangeIdx] === undefined || array[rangeIdx].name != rangeStart) {
            array = array
                .slice(0, rangeIdx)
                .concat([{ name: rangeStart.toString(), quantity: 0 }])
                .concat(array.slice(rangeIdx));
        }
        rangeIdx++;
    }

    return array;
}

// group array into subarrays based on a grouping function
function groupBy(arr, groupFunc, ...groupFuncArgs) {
    let groups = {};
    arr.forEach(x => {
        const groupValue = groupFunc(x, ...groupFuncArgs);
        groups[groupValue] = (groups[groupValue] || []).concat(x);
    });
    return Object.keys(groups).map(groupValue => ({ name: groupValue, value: groups[groupValue] }));
}

// group array into subarrays based on a grouping function and get the count of each group
function groupCountsBy(arr, groupFunc, ...groupFuncArgs) {
    let groups = {};
    arr.forEach(x => {
        const groupValue = groupFunc(x, ...groupFuncArgs);
        groups[groupValue] = (groups[groupValue] || []).concat(x);
    });
    return Object.keys(groups).map(groupValue => ({
        name: groupValue,
        quantity: groups[groupValue].length
    }));
}

const app = require("../../apiServer");

app.get("/admin/dataDisplay/factors", GET_factors);
app.get("/admin/dataDisplay/facets", GET_facets);
app.get("/admin/dataDisplay/questions", GET_questions);
app.get("/admin/dataDisplay/outputs", GET_outputs);
app.get("/admin/dataDisplay/scatter", GET_scatter);

module.exports = {
    GET_factors,
    GET_facets,
    GET_questions,
    GET_outputs,
    GET_scatter
};
