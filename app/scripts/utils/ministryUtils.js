import { familyLifeMinistryId } from "../constants/ministryIds";

export function isFamilyLifeEvent(conference) {
    return conference.ministry === familyLifeMinistryId;
}
