import * as React from 'react'
import {
  SandpackProvider,
  SandpackProviderProps,
  SandpackCodeEditor,
  SandpackPreview,
  SandpackThemeProvider,
  useSandpack,
  useSandpackNavigation,
  useSandpackTheme,
  SandpackPreviewRef,
  useSandpackConsole,
} from '@codesandbox/sandpack-react'
import { atomDark } from '@codesandbox/sandpack-themes'
import Tab from './Tab'
import Tabs from './Tabs'
import {
  ChevronDown,
  ChevronRight,
  Codesandbox,
  RefreshCw,
  Trash,
} from 'lucide-react'
import clsx from 'clsx'
import CopyCodeBlockButton from './CopyCodeBlockButton'
import Button from './Button'
import type { SandpackClient } from '@codesandbox/sandpack-client'
import IconButton from './IconButton'

type SandpackProps = SandpackProviderProps & {
  title: string
  initialURL?: string
  shouldShowNavigator?: boolean
  shouldShowConsole?: boolean
}

export default function Sandpack(props: SandpackProps) {
  const {
    title,
    initialURL,
    shouldShowNavigator = false,
    shouldShowConsole = false,
    ...rest
  } = props

  return (
    <SandpackProvider {...rest}>
      <SandpackThemeProvider
        theme={{
          ...atomDark,
          font: {
            body: '"Fira Sans", sans-serif',
            mono: 'Consolas, Menlo, Monaco, "Fira Code", monospace',
            size: '1rem',
            lineHeight: '1.5',
          },
        }}
      >
        <CustomSandpack
          title={title}
          initialURL={initialURL}
          shouldShowNavigator={shouldShowNavigator}
          shouldShowConsole={shouldShowConsole}
        />
      </SandpackThemeProvider>
    </SandpackProvider>
  )
}

type CustomSandpackProps = SandpackProps

function CustomSandpack(props: CustomSandpackProps) {
  const { title, initialURL, shouldShowNavigator, shouldShowConsole } = props

  const { sandpack } = useSandpack()
  const { files, activeFile, visibleFiles, setActiveFile } = sandpack

  const sandpackPreviewRef = React.useRef<SandpackPreviewRef>(null)
  const [client, setClient] = React.useState<SandpackClient | null>(null)
  const [clientId, setClientId] = React.useState<string | null>(null)

  React.useEffect(() => {
    const client = sandpackPreviewRef.current?.getClient()
    const clientId = sandpackPreviewRef.current?.clientId

    setClient(client ?? null)
    setClientId(clientId ?? null)
    /**
     * NOTE: In order to make sure that the client will be available
     * use the whole `sandpack` object as a dependency.
     */
  }, [sandpack])

  const [logsVisible, setLogsVisible] = React.useState(false)
  const { logs, reset } = useSandpackConsole({
    clientId: clientId ?? '',
    resetOnPreviewRestart: true,
    showSyntaxError: true,
  })

  const logsCount = logs.filter((log) =>
    log.data?.some((line) => line !== '')
  ).length
  const emptyLogs = logsCount === 0

  const logsContainerRef = React.useRef<HTMLDivElement>(null)

  const { theme } = useSandpackTheme()
  const { refresh } = useSandpackNavigation()

  const createAndNavigateToCodesandbox = async () => {
    if (!client) {
      return
    }

    const codesandboxUrl = await client
      // @ts-expect-error TODO: types from the codesandbox library might be broken
      .getCodeSandboxURL()
    if (codesandboxUrl?.editorUrl) {
      window.open(codesandboxUrl?.editorUrl, '_blank')
    }
  }

  return (
    <div
      className="my-8"
      style={
        {
          '--sandpack-surface1': theme.colors.surface1,
          '--sandpack-surface3': theme.colors.surface3,
          '--sandpack-accent': theme.colors.accent,
          '--sandpack-base': theme.colors.base,
        } as React.CSSProperties
      }
    >
      <Tabs
        value={activeFile}
        onChange={(newActiveFile) => {
          setActiveFile(newActiveFile)
        }}
      >
        {visibleFiles.map((file) => {
          const filename = file.replace(/^\//, '')

          return (
            <Tab
              className={clsx(
                '[&[aria-selected=true]]:bg-[var(--sandpack-surface1)]',
                '[&[aria-selected=true]]:text-[var(--sandpack-accent)]',
                '[&[aria-selected=true]]:shadow-sm',
                '[&[aria-selected=true]]:shadow-shadow',
                'hover:bg-[var(--sandpack-surface3)]',
                'hover:text-[var(--sandpack-base)]',
                'border-b-0',
                'font-normal'
              )}
              key={file}
              value={file}
              label={filename}
            />
          )
        })}
      </Tabs>

      <div className="full-width-on-mobile relative shadow-sm shadow-shadow sm:rounded-b">
        <div className="dark group relative [&_.sp-code-editor_*]:sm:rounded [&_.sp-code-editor_*]:sm:rounded-tl-none">
          <SandpackCodeEditor showTabs={false} />

          <CopyCodeBlockButton
            // TODO: internationalize this
            successTooltipText={'Copied'}
            errorTooltipText={'Error'}
            code={files[activeFile].code}
            className={clsx(
              'absolute',
              'right-0',
              'top-3',
              '-translate-x-1/2',
              'transition-opacity',
              'duration-500',
              'opacity-0',
              'pointer-events-none',
              'group-hover:opacity-100',
              'group-hover:pointer-events-auto',
              'focus:opacity-100',
              'focus:pointer-events-auto'
            )}
          />
        </div>

        <hr />

        <div
          className={clsx(
            'relative',
            !shouldShowConsole && '[&_.sp-preview-container]:sm:rounded-b',
            '[&_.sp-preview-container]:px-horizontal-padding',
            '[&_.sp-preview-container]:pt-3',
            '[&_.sp-stack]:bg-transparent'
          )}
        >
          <noscript>
            <div className="px-horizontal-padding pt-3 text-on-background">
              You need to enable JavaScript to preview the code.
            </div>
          </noscript>

          <SandpackPreview
            ref={sandpackPreviewRef}
            startRoute={initialURL}
            showNavigator={shouldShowNavigator}
            showRefreshButton={false}
            showOpenInCodeSandbox={false}
            title={title}
          />

          <div className="absolute bottom-3 right-horizontal-padding flex items-center gap-2">
            <Button
              color="secondary"
              onClick={createAndNavigateToCodesandbox}
              aria-label="Open on Codesandbox"
              className="shadow-sm shadow-shadow"
            >
              {/* TODO: Internationalize this */}
              <Codesandbox /> Open on CodeSandbox
            </Button>

            <IconButton
              variant="rounded"
              onClick={refresh}
              aria-label="Refresh"
              className="shadow-sm shadow-shadow"
            >
              <RefreshCw />
            </IconButton>
          </div>
        </div>

        {shouldShowConsole && (
          <>
            <hr />

            <details
              className="relative"
              onToggle={(e) => {
                e.preventDefault()
                setLogsVisible(!logsVisible)
              }}
            >
              <summary
                className={clsx(
                  `flex w-full list-none flex-row justify-start gap-2 rounded-b rounded-t-none bg-[var(--sandpack-surface1)] px-horizontal-padding py-2 text-[var(--sandpack-accent)] shadow-sm shadow-shadow [&::marker]:hidden [&::webkit-details-marker]:hidden`,
                  logsVisible && 'rounded-b-none'
                )}
              >
                {logsVisible ? <ChevronDown /> : <ChevronRight />} Show console
                ({logsCount})
              </summary>

              <div
                ref={logsContainerRef}
                className={clsx(
                  `max-h-40 overflow-y-auto rounded-b bg-[var(--sandpack-surface1)] py-2 text-[var(--sandpack-base)]`
                )}
              >
                {emptyLogs ? (
                  <div className="px-horizontal-padding">No logs yet</div>
                ) : (
                  <>
                    {logs
                      .filter((log) => log.data?.some((line) => line !== ''))
                      .map((log) => {
                        return (
                          <div
                            key={log.id}
                            className={clsx(
                              'border-l-2 px-horizontal-padding py-2 font-mono [overflow-anchor:none]',
                              log.method === 'error'
                                ? 'border-warn'
                                : 'border-note'
                            )}
                          >
                            {log.method === 'error' ? 'ERROR: ' : 'INFO: '}{' '}
                            {log.data
                              ?.map((d) =>
                                typeof d === 'object'
                                  ? JSON.stringify(d, null, 2)
                                  : d
                              )
                              .join('')}
                          </div>
                        )
                      })}

                    <div className="h-[1px] [overflow-anchor:auto]" />
                  </>
                )}
              </div>

              <div className="absolute right-horizontal-padding top-2 flex flex-row gap-2">
                <Button
                  color="secondary"
                  onClick={reset}
                  aria-label="Reset"
                  className="shadow-sm shadow-shadow"
                >
                  <Trash /> Clear logs
                </Button>
              </div>
            </details>
          </>
        )}
      </div>
    </div>
  )
}
