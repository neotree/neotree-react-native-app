export function isSessionPrintable(session: any) {
    return !!session?.data?.completed_at;
}

export function getSessionPrintBlockMessage(session: any) {
    if (isSessionPrintable(session)) return '';

    const scriptTitle = session?.data?.script?.data?.title || 'This session';
    return `${scriptTitle} cannot be printed because it is incomplete, interrupted, or cancelled. Complete the session before printing notes or QR labels.`;
}
