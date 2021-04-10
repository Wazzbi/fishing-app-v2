export const initialState = {
  selectedPost: null,
  posts: null,
  records: null,
  summaries: null,
  newsPageScrollPosition: null,
  reportedPosts: null,
};

const Reducer = (state, action) => {
  switch (action.type) {
    // POST
    case "ADD_SELECTED_POST":
      return {
        ...state,
        selectedPost: { ...action.payload },
      };
    case "ADD_POSTS":
      return {
        ...state,
        posts: { ...action.payload },
      };
    case "ADD_REPORTED_POSTS":
      return {
        ...state,
        reportedPosts: { ...action.payload },
      };
    // RECORDS
    case "ADD_RECORDS":
      return {
        ...state,
        records: { ...action.payload },
      };
    case "ADD_RECORD":
      return {
        ...state,
        records: {
          ...state.records,
          [action.payload.recordId]: {
            recordId: action.payload.recordId,
            ...action.payload,
          },
        },
      };
    case "DELETE_RECORD":
      const x = Object.entries(state.records).filter(
        ([rKey, rValue]) => rKey !== action.payload.recordUid
      );
      const y = Object.fromEntries(x);
      return {
        ...state,
        records: { ...y },
      };
    case "EDIT_RECORD_NAME":
      return {
        ...state,
        records: {
          ...state.records,
          [action.payload.recordUid]: action.payload.updatedRecord,
        },
      };
    case "ADD_RECORD_ROW":
      return {
        ...state,
        records: {
          ...state.records,
          [action.payload.recordUid]: {
            ...state.records[action.payload.recordUid],
            data: {
              ...state.records[action.payload.recordUid].data,
              [action.payload.rowId]: { ...action.payload.props },
            },
          },
        },
      };
    case "EDIT_RECORD_ROW":
      return {
        ...state,
        records: {
          ...state.records,
          [action.payload.recordUid]: action.payload.updatedRecord,
        },
      };

    case "DELETE_RECORD_ROW":
      const data = state.records[action.payload.recordUid].data;
      const w = Object.entries(data).filter(
        ([rKey, rValue]) => rKey !== action.payload.recordRowUid
      );
      const t = Object.fromEntries(w);
      return {
        ...state,
        records: {
          ...state.records,
          [action.payload.recordUid]: {
            ...state.records[action.payload.recordUid],
            data: { ...t },
          },
        },
      };
    // SUMMARIES
    case "ADD_SUMMARIES":
      return {
        ...state,
        summaries: { ...action.payload },
      };
    case "ADD_SUMMARY":
      return {
        ...state,
        summaries: {
          ...state.summaries,
          [action.payload.summaryId]: { ...action.payload },
        },
      };
    case "DELETE_SUMMARY":
      const o = Object.entries(state.summaries).filter(
        ([sKey, sValue]) => sKey !== action.payload.summaryUid
      );
      const v = Object.fromEntries(o);
      return {
        ...state,
        summaries: { ...v },
      };
    case "EDIT_SUMMARY":
      return {
        ...state,
        summaries: {
          ...state.summaries,
          [action.payload.summaryUid]: action.payload.updatedSummary,
        },
      };
    case "NEWS_SCROLL_POSITION":
      return {
        ...state,
        newsPageScrollPosition: action.payload,
      };

    default:
      return state;
  }
};

export default Reducer;
