import {
  createContext,
  PropsWithChildren,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { DeleteReportResult, SiteReport } from '@/types/report';
import { loadReports, saveReports } from '@/services/reportStorage';
import { removeManagedPhoto } from '@/services/photoStorage';
import { sortNewestFirst } from '@/utils/reportUtils';

interface ReportContextValue {
  reports: SiteReport[];
  isLoading: boolean;
  error: string | null;
  getReport: (id: string) => SiteReport | undefined;
  createReport: (report: SiteReport) => Promise<void>;
  updateReport: (report: SiteReport) => Promise<void>;
  deleteReport: (id: string) => Promise<DeleteReportResult>;
  reloadReports: () => Promise<void>;
  clearError: () => void;
}

export const ReportContext = createContext<ReportContextValue | null>(null);

export function ReportProvider({ children }: PropsWithChildren) {
  const [reports, setReports] = useState<SiteReport[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const reportsRef = useRef<SiteReport[]>([]);

  const commitReports = useCallback(async (nextReports: SiteReport[]) => {
    const sorted = sortNewestFirst(nextReports);
    await saveReports(sorted);
    reportsRef.current = sorted;
    setReports(sorted);
  }, []);

  const reloadReports = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const loaded = await loadReports();
      reportsRef.current = loaded;
      setReports(loaded);
    } catch (cause) {
      const message = cause instanceof Error ? cause.message : 'Unable to load saved inspections.';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;

    loadReports()
      .then((loaded) => {
        if (!isMounted) return;
        reportsRef.current = loaded;
        setReports(loaded);
      })
      .catch((cause) => {
        if (!isMounted) return;
        const message = cause instanceof Error ? cause.message : 'Unable to load saved inspections.';
        setError(message);
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const createReport = useCallback(
    async (report: SiteReport) => {
      setError(null);
      try {
        await commitReports([report, ...reportsRef.current]);
      } catch (cause) {
        const message = cause instanceof Error ? cause.message : 'Unable to save this inspection.';
        setError(message);
        throw new Error(message);
      }
    },
    [commitReports],
  );

  const updateReport = useCallback(
    async (report: SiteReport) => {
      setError(null);
      const exists = reportsRef.current.some((item) => item.id === report.id);
      if (!exists) throw new Error('This inspection no longer exists.');

      try {
        await commitReports(
          reportsRef.current.map((item) => (item.id === report.id ? report : item)),
        );
      } catch (cause) {
        const message = cause instanceof Error ? cause.message : 'Unable to update this inspection.';
        setError(message);
        throw new Error(message);
      }
    },
    [commitReports],
  );

  const deleteReport = useCallback(
    async (id: string): Promise<DeleteReportResult> => {
      setError(null);
      const target = reportsRef.current.find((report) => report.id === id);
      if (!target) throw new Error('This inspection no longer exists.');

      try {
        await commitReports(reportsRef.current.filter((report) => report.id !== id));
      } catch (cause) {
        const message = cause instanceof Error ? cause.message : 'Unable to delete this inspection.';
        setError(message);
        throw new Error(message);
      }

      let photoCleanupFailed = false;
      try {
        removeManagedPhoto(target.photo?.uri);
      } catch {
        photoCleanupFailed = true;
      }
      return { photoCleanupFailed };
    },
    [commitReports],
  );

  const getReport = useCallback(
    (id: string) => reports.find((report) => report.id === id),
    [reports],
  );

  const value = useMemo<ReportContextValue>(
    () => ({
      reports,
      isLoading,
      error,
      getReport,
      createReport,
      updateReport,
      deleteReport,
      reloadReports,
      clearError: () => setError(null),
    }),
    [
      reports,
      isLoading,
      error,
      getReport,
      createReport,
      updateReport,
      deleteReport,
      reloadReports,
    ],
  );

  return <ReportContext.Provider value={value}>{children}</ReportContext.Provider>;
}
