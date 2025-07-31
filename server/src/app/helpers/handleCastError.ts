


export const handleCastError = () => {
  return {
    statusCode:400,
    message: "Invalid MongoDB ObjectId. Please provide valid id",
  };
};