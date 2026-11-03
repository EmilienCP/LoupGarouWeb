import "reflect-metadata";
import { ProbabiliteLoupsService } from "./services/probabiliteLoups.service";

const service = new ProbabiliteLoupsService(false);

console.log(service.getNbLoups(20, [], false));

