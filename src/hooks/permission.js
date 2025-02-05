export const isPermissionGranted = (user, permission) => {
    return !!user?.role?.permissions.find(({name}) => name.toLowerCase() === permission.toLowerCase());
}