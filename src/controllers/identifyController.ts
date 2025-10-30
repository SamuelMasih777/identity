import result from "../models/result";
import identifyService from "../services/identifyService";

class identifyController {
  async identifyContact(params: any) {
    const res = new result();
    try {
      const data = await identifyService.identifyContact(params);
      res.status = 200;
      res.data = data;
    } catch (error: any) {
      console.error(`Error in identifyContact: ${error}`);
      res.status = error.status || 500;
      res.message = error.message || "Internal Server Error";
    }
    return res;
  }
}
export default new identifyController();
