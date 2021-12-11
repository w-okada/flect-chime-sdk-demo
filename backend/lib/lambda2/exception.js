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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXhjZXB0aW9uLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiZXhjZXB0aW9uLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUNBLE1BQWEsT0FBTztJQUNoQixZQUFxQixLQUFRO1FBQVIsVUFBSyxHQUFMLEtBQUssQ0FBRztRQUM3QixTQUFJLEdBQUcsU0FBa0IsQ0FBQyxDQUFDLFFBQVE7SUFESCxDQUFDO0lBRWpDLFNBQVM7UUFDTCxPQUFPLElBQUksQ0FBQztJQUNoQixDQUFDO0lBQ0QsU0FBUztRQUNMLE9BQU8sS0FBSyxDQUFDO0lBQ2pCLENBQUM7Q0FDSjtBQVRELDBCQVNDO0FBQ0QsTUFBYSxPQUFPO0lBQ2hCLFlBQXFCLEtBQVE7UUFBUixVQUFLLEdBQUwsS0FBSyxDQUFHO1FBQzdCLFNBQUksR0FBRyxTQUFrQixDQUFDLENBQUMsUUFBUTtJQURILENBQUM7SUFFakMsU0FBUztRQUNMLE9BQU8sS0FBSyxDQUFDO0lBQ2pCLENBQUM7SUFDRCxTQUFTO1FBQ0wsT0FBTyxJQUFJLENBQUM7SUFDaEIsQ0FBQztDQUNKO0FBVEQsMEJBU0M7QUFDRCxNQUFhLGVBQWdCLFNBQVEsS0FBSztDQUFHO0FBQTdDLDBDQUE2QyIsInNvdXJjZXNDb250ZW50IjpbImV4cG9ydCB0eXBlIFJlc3VsdDxULCBFPiA9IFN1Y2Nlc3M8VCwgRT4gfCBGYWlsdXJlPFQsIEU+O1xuZXhwb3J0IGNsYXNzIFN1Y2Nlc3M8VCwgRT4ge1xuICAgIGNvbnN0cnVjdG9yKHJlYWRvbmx5IHZhbHVlOiBUKSB7fVxuICAgIHR5cGUgPSBcInN1Y2Nlc3NcIiBhcyBjb25zdDsgLy8g44GT44GT44KS6L+95YqgXG4gICAgaXNTdWNjZXNzKCk6IHRoaXMgaXMgU3VjY2VzczxULCBFPiB7XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cbiAgICBpc0ZhaWx1cmUoKTogdGhpcyBpcyBGYWlsdXJlPFQsIEU+IHtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbn1cbmV4cG9ydCBjbGFzcyBGYWlsdXJlPFQsIEU+IHtcbiAgICBjb25zdHJ1Y3RvcihyZWFkb25seSB2YWx1ZTogRSkge31cbiAgICB0eXBlID0gXCJmYWlsdXJlXCIgYXMgY29uc3Q7IC8vIOOBk+OBk+OCkui/veWKoFxuICAgIGlzU3VjY2VzcygpOiB0aGlzIGlzIFN1Y2Nlc3M8VCwgRT4ge1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICAgIGlzRmFpbHVyZSgpOiB0aGlzIGlzIEZhaWx1cmU8VCwgRT4ge1xuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG59XG5leHBvcnQgY2xhc3MgTm9TdWNoUm9vbUVycm9yIGV4dGVuZHMgRXJyb3Ige31cbiJdfQ==