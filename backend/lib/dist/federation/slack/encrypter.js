"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Encrypter = void 0;
const crypto = __importStar(require("crypto"));
class Encrypter {
    constructor(params) {
        this.algorithm = "aes-256-cbc";
        this.generateRandomString = (length) => {
            return crypto.randomBytes(length).reduce((p, i) => p + (i % 36).toString(36), "");
        };
        this.encodeInformation = (info) => {
            const envelop = {
                data: info,
                secret: this.secret,
                expireSec: Math.floor(new Date().getTime() / 1000) + this.expireSec,
            };
            const cipher = crypto.createCipheriv(this.algorithm, this.key, this.iv); // 暗号用インスタンス
            const cipheredData = cipher.update(JSON.stringify(envelop), "utf8", "hex") + cipher.final("hex");
            return cipheredData;
        };
        this.decodeInformation = (cipheredData) => {
            const decipher = crypto.createDecipheriv(this.algorithm, this.key, this.iv); // 復号用インスタンス
            const decipheredDataJson = decipher.update(cipheredData, "hex", "utf8") + decipher.final("utf8");
            const decipheredData = JSON.parse(decipheredDataJson);
            const nowTime = Math.floor(new Date().getTime() / 1000);
            console.log(this.expireSec);
            console.log(decipheredData.expireSec);
            console.log(nowTime);
            if (this.expireSec > 0 && decipheredData.expireSec < nowTime) {
                console.log(`Expired User Info: ${decipheredData.expireSec} < ${nowTime}`);
                return null;
            }
            else if (decipheredData.secret === this.secret) {
                decipheredData.secret = undefined;
                return decipheredData.data;
            }
            else {
                console.log("!!!!!!!!!!! secret is not match !!!!!!!!!!!");
                return null;
            }
        };
        this.password = params.password || this.generateRandomString(16);
        this.salt = params.salt || this.generateRandomString(16);
        this.secret = params.secret || this.generateRandomString(16);
        this.key = crypto.scryptSync(this.password, this.salt, 32);
        this.expireSec = params.expireSec || -1;
        // this.iv = params.iv || crypto.randomBytes(16);
        this.iv = Buffer.from([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15]);
    }
}
exports.Encrypter = Encrypter;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZW5jcnlwdGVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vbGFtYmRhMi9mZWRlcmF0aW9uL3NsYWNrL2VuY3J5cHRlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQUEsK0NBQWlDO0FBZWpDLE1BQWEsU0FBUztJQVNsQixZQUFZLE1BQXVCO1FBUm5DLGNBQVMsR0FBRyxhQUFhLENBQUM7UUFrQmxCLHlCQUFvQixHQUFHLENBQUMsTUFBYyxFQUFFLEVBQUU7WUFDOUMsT0FBTyxNQUFNLENBQUMsV0FBVyxDQUFDLE1BQU0sQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxFQUFFLENBQUMsQ0FBQyxRQUFRLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUM7UUFDdEYsQ0FBQyxDQUFDO1FBRUYsc0JBQWlCLEdBQUcsQ0FBQyxJQUFPLEVBQVUsRUFBRTtZQUNwQyxNQUFNLE9BQU8sR0FBZTtnQkFDeEIsSUFBSSxFQUFFLElBQUk7Z0JBQ1YsTUFBTSxFQUFFLElBQUksQ0FBQyxNQUFNO2dCQUNuQixTQUFTLEVBQUUsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLElBQUksRUFBRSxDQUFDLE9BQU8sRUFBRSxHQUFHLElBQUksQ0FBQyxHQUFHLElBQUksQ0FBQyxTQUFTO2FBQ3RFLENBQUM7WUFDRixNQUFNLE1BQU0sR0FBRyxNQUFNLENBQUMsY0FBYyxDQUFDLElBQUksQ0FBQyxTQUFTLEVBQUUsSUFBSSxDQUFDLEdBQUcsRUFBRSxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxZQUFZO1lBQ3JGLE1BQU0sWUFBWSxHQUFHLE1BQU0sQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxPQUFPLENBQUMsRUFBRSxNQUFNLEVBQUUsS0FBSyxDQUFDLEdBQUcsTUFBTSxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsQ0FBQztZQUNqRyxPQUFPLFlBQVksQ0FBQztRQUN4QixDQUFDLENBQUM7UUFFRixzQkFBaUIsR0FBRyxDQUFDLFlBQW9CLEVBQVksRUFBRTtZQUNuRCxNQUFNLFFBQVEsR0FBRyxNQUFNLENBQUMsZ0JBQWdCLENBQUMsSUFBSSxDQUFDLFNBQVMsRUFBRSxJQUFJLENBQUMsR0FBRyxFQUFFLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLFlBQVk7WUFDekYsTUFBTSxrQkFBa0IsR0FBRyxRQUFRLENBQUMsTUFBTSxDQUFDLFlBQVksRUFBRSxLQUFLLEVBQUUsTUFBTSxDQUFDLEdBQUcsUUFBUSxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsQ0FBQztZQUNqRyxNQUFNLGNBQWMsR0FBZSxJQUFJLENBQUMsS0FBSyxDQUFDLGtCQUFrQixDQUFDLENBQUM7WUFDbEUsTUFBTSxPQUFPLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLElBQUksRUFBRSxDQUFDLE9BQU8sRUFBRSxHQUFHLElBQUksQ0FBQyxDQUFDO1lBQ3hELE9BQU8sQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDO1lBQzVCLE9BQU8sQ0FBQyxHQUFHLENBQUMsY0FBYyxDQUFDLFNBQVMsQ0FBQyxDQUFDO1lBQ3RDLE9BQU8sQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLENBQUM7WUFDckIsSUFBSSxJQUFJLENBQUMsU0FBUyxHQUFHLENBQUMsSUFBSSxjQUFjLENBQUMsU0FBUyxHQUFHLE9BQU8sRUFBRTtnQkFDMUQsT0FBTyxDQUFDLEdBQUcsQ0FBQyxzQkFBc0IsY0FBYyxDQUFDLFNBQVMsTUFBTSxPQUFPLEVBQUUsQ0FBQyxDQUFDO2dCQUMzRSxPQUFPLElBQUksQ0FBQzthQUNmO2lCQUFNLElBQUksY0FBYyxDQUFDLE1BQU0sS0FBSyxJQUFJLENBQUMsTUFBTSxFQUFFO2dCQUM5QyxjQUFjLENBQUMsTUFBTSxHQUFHLFNBQVMsQ0FBQztnQkFDbEMsT0FBTyxjQUFjLENBQUMsSUFBSSxDQUFDO2FBQzlCO2lCQUFNO2dCQUNILE9BQU8sQ0FBQyxHQUFHLENBQUMsNkNBQTZDLENBQUMsQ0FBQztnQkFDM0QsT0FBTyxJQUFJLENBQUM7YUFDZjtRQUNMLENBQUMsQ0FBQztRQTFDRSxJQUFJLENBQUMsUUFBUSxHQUFHLE1BQU0sQ0FBQyxRQUFRLElBQUksSUFBSSxDQUFDLG9CQUFvQixDQUFDLEVBQUUsQ0FBQyxDQUFDO1FBQ2pFLElBQUksQ0FBQyxJQUFJLEdBQUcsTUFBTSxDQUFDLElBQUksSUFBSSxJQUFJLENBQUMsb0JBQW9CLENBQUMsRUFBRSxDQUFDLENBQUM7UUFDekQsSUFBSSxDQUFDLE1BQU0sR0FBRyxNQUFNLENBQUMsTUFBTSxJQUFJLElBQUksQ0FBQyxvQkFBb0IsQ0FBQyxFQUFFLENBQUMsQ0FBQztRQUM3RCxJQUFJLENBQUMsR0FBRyxHQUFHLE1BQU0sQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLFFBQVEsRUFBRSxJQUFJLENBQUMsSUFBSSxFQUFFLEVBQUUsQ0FBQyxDQUFDO1FBQzNELElBQUksQ0FBQyxTQUFTLEdBQUcsTUFBTSxDQUFDLFNBQVMsSUFBSSxDQUFDLENBQUMsQ0FBQztRQUN4QyxpREFBaUQ7UUFDakQsSUFBSSxDQUFDLEVBQUUsR0FBRyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQztJQUNsRixDQUFDO0NBb0NKO0FBckRELDhCQXFEQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCAqIGFzIGNyeXB0byBmcm9tIFwiY3J5cHRvXCI7XG5cbmV4cG9ydCB0eXBlIEVudmVsb3A8VD4gPSB7XG4gICAgZGF0YTogVDtcbiAgICBzZWNyZXQ/OiBzdHJpbmc7XG4gICAgZXhwaXJlU2VjOiBudW1iZXI7XG59O1xuXG5leHBvcnQgdHlwZSBFbmNyeXB0ZXJQYXJhbXMgPSB7XG4gICAgcGFzc3dvcmQ/OiBzdHJpbmc7XG4gICAgc2FsdD86IHN0cmluZztcbiAgICBzZWNyZXQ/OiBzdHJpbmc7XG4gICAgZXhwaXJlU2VjPzogbnVtYmVyO1xufTtcblxuZXhwb3J0IGNsYXNzIEVuY3J5cHRlcjxUPiB7XG4gICAgYWxnb3JpdGhtID0gXCJhZXMtMjU2LWNiY1wiO1xuXG4gICAgcGFzc3dvcmQ6IHN0cmluZztcbiAgICBzYWx0OiBzdHJpbmc7XG4gICAgc2VjcmV0OiBzdHJpbmc7IC8vIHBhc3PjgahzYWx044GM5ryP44KM44Gm44KCZGVjb2Rl44Gn44GN44Gq44GE44KI44GG44Gr44OX44Ot44K744K55YaF44Gn5L+d5oyB4oeSTGFtYmRh5YyW44Gr44KI44KKU3RhdGlj44Gr44Gq44Gj44Gm44GX44G+44Gj44Gf44CCVE9ETzog6Ieq5YuV55Sf5oiQ77yGRELnmbvpjLLjgarjganjgYzlv4XopoHjgIJcbiAgICBrZXk6IEJ1ZmZlcjtcbiAgICBpdjogQnVmZmVyO1xuICAgIGV4cGlyZVNlYzogbnVtYmVyO1xuICAgIGNvbnN0cnVjdG9yKHBhcmFtczogRW5jcnlwdGVyUGFyYW1zKSB7XG4gICAgICAgIHRoaXMucGFzc3dvcmQgPSBwYXJhbXMucGFzc3dvcmQgfHwgdGhpcy5nZW5lcmF0ZVJhbmRvbVN0cmluZygxNik7XG4gICAgICAgIHRoaXMuc2FsdCA9IHBhcmFtcy5zYWx0IHx8IHRoaXMuZ2VuZXJhdGVSYW5kb21TdHJpbmcoMTYpO1xuICAgICAgICB0aGlzLnNlY3JldCA9IHBhcmFtcy5zZWNyZXQgfHwgdGhpcy5nZW5lcmF0ZVJhbmRvbVN0cmluZygxNik7XG4gICAgICAgIHRoaXMua2V5ID0gY3J5cHRvLnNjcnlwdFN5bmModGhpcy5wYXNzd29yZCwgdGhpcy5zYWx0LCAzMik7XG4gICAgICAgIHRoaXMuZXhwaXJlU2VjID0gcGFyYW1zLmV4cGlyZVNlYyB8fCAtMTtcbiAgICAgICAgLy8gdGhpcy5pdiA9IHBhcmFtcy5pdiB8fCBjcnlwdG8ucmFuZG9tQnl0ZXMoMTYpO1xuICAgICAgICB0aGlzLml2ID0gQnVmZmVyLmZyb20oWzAsIDEsIDIsIDMsIDQsIDUsIDYsIDcsIDgsIDksIDEwLCAxMSwgMTIsIDEzLCAxNCwgMTVdKTtcbiAgICB9XG5cbiAgICBwcml2YXRlIGdlbmVyYXRlUmFuZG9tU3RyaW5nID0gKGxlbmd0aDogbnVtYmVyKSA9PiB7XG4gICAgICAgIHJldHVybiBjcnlwdG8ucmFuZG9tQnl0ZXMobGVuZ3RoKS5yZWR1Y2UoKHAsIGkpID0+IHAgKyAoaSAlIDM2KS50b1N0cmluZygzNiksIFwiXCIpO1xuICAgIH07XG5cbiAgICBlbmNvZGVJbmZvcm1hdGlvbiA9IChpbmZvOiBUKTogc3RyaW5nID0+IHtcbiAgICAgICAgY29uc3QgZW52ZWxvcDogRW52ZWxvcDxUPiA9IHtcbiAgICAgICAgICAgIGRhdGE6IGluZm8sXG4gICAgICAgICAgICBzZWNyZXQ6IHRoaXMuc2VjcmV0LFxuICAgICAgICAgICAgZXhwaXJlU2VjOiBNYXRoLmZsb29yKG5ldyBEYXRlKCkuZ2V0VGltZSgpIC8gMTAwMCkgKyB0aGlzLmV4cGlyZVNlYyxcbiAgICAgICAgfTtcbiAgICAgICAgY29uc3QgY2lwaGVyID0gY3J5cHRvLmNyZWF0ZUNpcGhlcml2KHRoaXMuYWxnb3JpdGhtLCB0aGlzLmtleSwgdGhpcy5pdik7IC8vIOaal+WPt+eUqOOCpOODs+OCueOCv+ODs+OCuVxuICAgICAgICBjb25zdCBjaXBoZXJlZERhdGEgPSBjaXBoZXIudXBkYXRlKEpTT04uc3RyaW5naWZ5KGVudmVsb3ApLCBcInV0ZjhcIiwgXCJoZXhcIikgKyBjaXBoZXIuZmluYWwoXCJoZXhcIik7XG4gICAgICAgIHJldHVybiBjaXBoZXJlZERhdGE7XG4gICAgfTtcblxuICAgIGRlY29kZUluZm9ybWF0aW9uID0gKGNpcGhlcmVkRGF0YTogc3RyaW5nKTogVCB8IG51bGwgPT4ge1xuICAgICAgICBjb25zdCBkZWNpcGhlciA9IGNyeXB0by5jcmVhdGVEZWNpcGhlcml2KHRoaXMuYWxnb3JpdGhtLCB0aGlzLmtleSwgdGhpcy5pdik7IC8vIOW+qeWPt+eUqOOCpOODs+OCueOCv+ODs+OCuVxuICAgICAgICBjb25zdCBkZWNpcGhlcmVkRGF0YUpzb24gPSBkZWNpcGhlci51cGRhdGUoY2lwaGVyZWREYXRhLCBcImhleFwiLCBcInV0ZjhcIikgKyBkZWNpcGhlci5maW5hbChcInV0ZjhcIik7XG4gICAgICAgIGNvbnN0IGRlY2lwaGVyZWREYXRhOiBFbnZlbG9wPFQ+ID0gSlNPTi5wYXJzZShkZWNpcGhlcmVkRGF0YUpzb24pO1xuICAgICAgICBjb25zdCBub3dUaW1lID0gTWF0aC5mbG9vcihuZXcgRGF0ZSgpLmdldFRpbWUoKSAvIDEwMDApO1xuICAgICAgICBjb25zb2xlLmxvZyh0aGlzLmV4cGlyZVNlYyk7XG4gICAgICAgIGNvbnNvbGUubG9nKGRlY2lwaGVyZWREYXRhLmV4cGlyZVNlYyk7XG4gICAgICAgIGNvbnNvbGUubG9nKG5vd1RpbWUpO1xuICAgICAgICBpZiAodGhpcy5leHBpcmVTZWMgPiAwICYmIGRlY2lwaGVyZWREYXRhLmV4cGlyZVNlYyA8IG5vd1RpbWUpIHtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKGBFeHBpcmVkIFVzZXIgSW5mbzogJHtkZWNpcGhlcmVkRGF0YS5leHBpcmVTZWN9IDwgJHtub3dUaW1lfWApO1xuICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgIH0gZWxzZSBpZiAoZGVjaXBoZXJlZERhdGEuc2VjcmV0ID09PSB0aGlzLnNlY3JldCkge1xuICAgICAgICAgICAgZGVjaXBoZXJlZERhdGEuc2VjcmV0ID0gdW5kZWZpbmVkO1xuICAgICAgICAgICAgcmV0dXJuIGRlY2lwaGVyZWREYXRhLmRhdGE7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhcIiEhISEhISEhISEhIHNlY3JldCBpcyBub3QgbWF0Y2ggISEhISEhISEhISFcIik7XG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgfVxuICAgIH07XG59XG4iXX0=