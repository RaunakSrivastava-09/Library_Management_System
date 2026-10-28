export function successResponse(data, status = 200) {
  return Response.json(
    {
      success: true,
      data,
    },
    { status }
  );
}

export function errorResponse(message, status = 400) {
  return Response.json(
    {
      success: false,
      error: message,
    },
    { status }
  );
}