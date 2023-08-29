import {atom, selector} from "recoil";

const userInfoState = atom({
    key: "userInfoState", default: {}
});

const allPlansState = atom({
    key: "allPlansState", default: []
})

const addflagState = atom({
    key: "addActivityFlag", default: false
})

const currentPageState = atom({
    key: "currentPageState", default: "0"
})

const currentPlanState = atom({
    key: "currentPlanState", default: {}
})

const isConnectedState = selector({
    key: "isConnectedState", get: ({get}) => {
        const userInfo = get(userInfoState);

        return Object.keys(userInfo).length !== 0;
    }
})

const filteredPlansSelector = selector({
    key: "filteredPlansSelector", get: ({get}) => {
        const allPlans = get(allPlansState);
        const userInfo = get(userInfoState);

        // Filter plans based on userInfo._id
        const filteredPlans = allPlans.filter((plan) => plan.name_id === userInfo._id);

        return filteredPlans;
    },
});

export {
    userInfoState, allPlansState, isConnectedState, currentPlanState, addflagState, filteredPlansSelector, currentPageState
};
