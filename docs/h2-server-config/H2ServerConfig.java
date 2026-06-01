package com.example.config;

import org.h2.tools.Server;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.sql.SQLException;

/**
 * H2 数据库服务器配置
 * 
 * 在 Spring Boot 启动时自动启动 H2 TCP 和 PostgreSQL 协议服务器，
 * 允许外部工具（如 VS Code Database Client 扩展）连接。
 * 
 * 使用方式：
 * 1. 在 application.yml 中配置：
 *    h2:
 *      server:
 *        enabled: true
 *        tcp-port: 9092
 *        pg-port: 5435
 * 
 * 2. VS Code 扩展连接配置：
 *    - TCP 模式：host=127.0.0.1, port=9092
 *    - PG 模式：host=127.0.0.1, port=5435
 */
@Configuration
@ConditionalOnProperty(name = "h2.server.enabled", havingValue = "true", matchIfMissing = false)
public class H2ServerConfig {

    @Value("${h2.server.tcp-port:9092}")
    private String tcpPort;

    @Value("${h2.server.pg-port:5435}")
    private String pgPort;

    /**
     * 启动 H2 TCP 服务器
     * VS Code 扩展可通过 TCP 模式连接
     */
    @Bean(initMethod = "start", destroyMethod = "stop")
    public Server h2TcpServer() throws SQLException {
        System.out.println("[H2] Starting TCP server on port " + tcpPort);
        return Server.createTcpServer("-tcpPort", tcpPort, "-tcpAllowOthers");
    }

    /**
     * 启动 H2 PostgreSQL 协议服务器
     * VS Code 扩展可通过 PG 模式连接
     */
    @Bean(initMethod = "start", destroyMethod = "stop")
    public Server h2PgServer() throws SQLException {
        System.out.println("[H2] Starting PostgreSQL protocol server on port " + pgPort);
        return Server.createPgServer("-pgPort", pgPort, "-pgAllowOthers");
    }
}
