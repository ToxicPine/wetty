const getRemoteAddress = (remoteAddress: string): string => {
  const part = remoteAddress.split(":")[3];
  return part === undefined ? "localhost" : part;
};

export function loginOptions(command: string, remoteAddress: string): string[] {
  return command === "login"
    ? [command, "-h", getRemoteAddress(remoteAddress)]
    : [command];
}
