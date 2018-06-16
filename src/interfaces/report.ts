interface IReport {
  url: string;
  event: string;
  content: any;
}

const report = (url, event, content): IReport => {
  return {
    url,
    event,
    content,
  };
};

export default report;
