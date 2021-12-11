"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NoSuchRoomError = exports.Failure = exports.Success = void 0;
class Success {
    constructor(value) {
        this.value = value;
        this.type = "success"; // ここを追加
    }
    isSuccess() {
        return true;
    }
    isFailure() {
        return false;
    }
}
exports.Success = Success;
class Failure {
    constructor(value) {
        this.value = value;
        this.type = "failure"; // ここを追加
    }
    isSuccess() {
        return false;
    }
    isFailure() {
        return true;
    }
}
exports.Failure = Failure;
class NoSuchRoomError extends Error {
}
exports.NoSuchRoomError = NoSuchRoomError;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXhjZXB0aW9uLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vbGFtYmRhMi9leGNlcHRpb24udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQ0EsTUFBYSxPQUFPO0lBQ2hCLFlBQXFCLEtBQVE7UUFBUixVQUFLLEdBQUwsS0FBSyxDQUFHO1FBQzdCLFNBQUksR0FBRyxTQUFrQixDQUFDLENBQUMsUUFBUTtJQURILENBQUM7SUFFakMsU0FBUztRQUNMLE9BQU8sSUFBSSxDQUFDO0lBQ2hCLENBQUM7SUFDRCxTQUFTO1FBQ0wsT0FBTyxLQUFLLENBQUM7SUFDakIsQ0FBQztDQUNKO0FBVEQsMEJBU0M7QUFDRCxNQUFhLE9BQU87SUFDaEIsWUFBcUIsS0FBUTtRQUFSLFVBQUssR0FBTCxLQUFLLENBQUc7UUFDN0IsU0FBSSxHQUFHLFNBQWtCLENBQUMsQ0FBQyxRQUFRO0lBREgsQ0FBQztJQUVqQyxTQUFTO1FBQ0wsT0FBTyxLQUFLLENBQUM7SUFDakIsQ0FBQztJQUNELFNBQVM7UUFDTCxPQUFPLElBQUksQ0FBQztJQUNoQixDQUFDO0NBQ0o7QUFURCwwQkFTQztBQUNELE1BQWEsZUFBZ0IsU0FBUSxLQUFLO0NBQUc7QUFBN0MsMENBQTZDIiwic291cmNlc0NvbnRlbnQiOlsiZXhwb3J0IHR5cGUgUmVzdWx0PFQsIEU+ID0gU3VjY2VzczxULCBFPiB8IEZhaWx1cmU8VCwgRT47XG5leHBvcnQgY2xhc3MgU3VjY2VzczxULCBFPiB7XG4gICAgY29uc3RydWN0b3IocmVhZG9ubHkgdmFsdWU6IFQpIHt9XG4gICAgdHlwZSA9IFwic3VjY2Vzc1wiIGFzIGNvbnN0OyAvLyDjgZPjgZPjgpLov73liqBcbiAgICBpc1N1Y2Nlc3MoKTogdGhpcyBpcyBTdWNjZXNzPFQsIEU+IHtcbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuICAgIGlzRmFpbHVyZSgpOiB0aGlzIGlzIEZhaWx1cmU8VCwgRT4ge1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxufVxuZXhwb3J0IGNsYXNzIEZhaWx1cmU8VCwgRT4ge1xuICAgIGNvbnN0cnVjdG9yKHJlYWRvbmx5IHZhbHVlOiBFKSB7fVxuICAgIHR5cGUgPSBcImZhaWx1cmVcIiBhcyBjb25zdDsgLy8g44GT44GT44KS6L+95YqgXG4gICAgaXNTdWNjZXNzKCk6IHRoaXMgaXMgU3VjY2VzczxULCBFPiB7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gICAgaXNGYWlsdXJlKCk6IHRoaXMgaXMgRmFpbHVyZTxULCBFPiB7XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cbn1cbmV4cG9ydCBjbGFzcyBOb1N1Y2hSb29tRXJyb3IgZXh0ZW5kcyBFcnJvciB7fVxuIl19