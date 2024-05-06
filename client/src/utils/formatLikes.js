const formatLikes = (likes) => {
  if (likes >= 1000000) {
    return `${(likes / 1000000).toFixed(1)}M`;
  } else if (likes >= 1000) {
    return `${(likes / 1000).toFixed(1)}K`;
  } else {
    return likes.toString();
  }
};

export default formatLikes;
