package com.cosmetovigilance.config;

import jakarta.servlet.ServletOutputStream;
import jakarta.servlet.WriteListener;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpServletResponseWrapper;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.OutputStreamWriter;
import java.io.PrintWriter;
import java.nio.charset.StandardCharsets;

/**
 * Wrapper qui met en buffer le corps de la réponse pour permettre un encodage (ex. AES) après le filtre.
 */
public class BufferingResponseWrapper extends HttpServletResponseWrapper {

    private final ByteArrayOutputStream buffer = new ByteArrayOutputStream();
    private ServletOutputStream outputStream;
    private PrintWriter writer;
    private String cachedContentType;

    public BufferingResponseWrapper(HttpServletResponse response) {
        super(response);
    }

    @Override
    public void setContentType(String type) {
        super.setContentType(type);
        this.cachedContentType = type;
    }

    @Override
    public String getContentType() {
        if (cachedContentType != null) {
            return cachedContentType;
        }
        return super.getContentType();
    }

    @Override
    public ServletOutputStream getOutputStream() throws IOException {
        if (writer != null) {
            throw new IllegalStateException("getWriter() already called");
        }
        if (outputStream == null) {
            outputStream = new ServletOutputStream() {
                @Override
                public boolean isReady() {
                    return true;
                }

                @Override
                public void setWriteListener(WriteListener listener) {
                }

                @Override
                public void write(int b) throws IOException {
                    buffer.write(b);
                }

                @Override
                public void write(byte[] b, int off, int len) throws IOException {
                    buffer.write(b, off, len);
                }
            };
        }
        return outputStream;
    }

    @Override
    public PrintWriter getWriter() throws IOException {
        if (outputStream != null) {
            throw new IllegalStateException("getOutputStream() already called");
        }
        if (writer == null) {
            writer = new PrintWriter(new OutputStreamWriter(buffer, StandardCharsets.UTF_8));
        }
        return writer;
    }

    public byte[] getBuffer() throws IOException {
        if (writer != null) {
            writer.flush();
            writer.close();
        }
        if (outputStream != null) {
            outputStream.flush();
        }
        return buffer.toByteArray();
    }
}
