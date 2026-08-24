export const GUIDED_QUESTIONS_STYLES = `
        .wp-chat-guided-questions {
            display: none;
            width: 100%;
            max-width: 504px;
            min-height: 128px;
            height: auto;
            box-sizing: border-box;
            flex-direction: column;
            align-items: flex-end;
            gap: 8px;
            padding: 8px 16px;
            background: #FFFFFF;
            border-radius: 0;
            flex-shrink: 0;
            margin-top: auto;
        }

        .wp-chat-modal .wp-chat-guided-question {
            display: flex;
            max-width: 100%;
            min-height: 32px;
            height: auto;
            box-sizing: border-box;
            align-items: center;
            border: 1px solid #F2F2F2 !important;
            border-radius: 4px !important;
            background: #F7F8FA !important;
            color: #474D53 !important;
            font: 400 14px/24px 'BCSans', sans-serif !important;
            cursor: pointer;
            flex-shrink: 0;
            padding: 4px 8px !important;
            text-align: left;
            white-space: normal;
            overflow-wrap: anywhere;
        }

        .wp-chat-modal .wp-chat-guided-question:hover {
            background: #F2F2F2;
        }
`;
